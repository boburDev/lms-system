import { Request, Response } from 'express'
import { validateObjectSignup } from '../../utils/validation'
import { Companies, CompanyBranches } from '../../entities/company.entity'
import EmployersEntity from '../../entities/employers.entity'
import AppDataSource from '../../config/ormconfig'
import { sign } from '../../utils/jwt'
import { comparePassword } from '../../utils/bcrypt'
import { IsNull } from 'typeorm'
import positionIndicator from '../../utils/employer_positions'

export const login = async (req:Request, res: Response) => {
    try {
        const { userphone, password } = req.body
        const employerRepository = AppDataSource.getRepository(EmployersEntity)
        let employerData = await employerRepository.find({ where: { employer_phone: userphone, employer_deleted: IsNull() } })
        if (!employerData.length) throw new Error("User not found");
        
        const branchRepository = AppDataSource.getRepository(CompanyBranches)

        const results = []
        for (const user of employerData) {
            if (await comparePassword(password, user.employer_password)) {
                let payload = {
                    branchId: user.employer_branch_id,
                    colleagueId: user.employer_id,
                    role: positionIndicator(user.employer_position)
                }
                let branchData = await branchRepository.findOne({
                    where: { company_branch_id: user.employer_branch_id, company_branch_deleted: IsNull() },
                    relations: ['companies', 'districts']
                })

                results.push({
                    token: sign(payload),
                    redirect_link: `http://${branchData?.company_branch_subdomen}.localhost:3000/`,
                    companyName: branchData?.companies.company_name,
                    userName: user.employer_name,
                    role: positionIndicator(user.employer_position)
                })
            }
        }
        res.json({ data: results, error: null })
    } catch (error:unknown) {
        res.status(400).json({ data: null, error: (error as Error).message})
    }
}

export const signup = async (req:Request, res: Response) => {
    try {
        const { error, value } = validateObjectSignup(req.body)
        if (error?.message) throw new Error(error.message)
        const companyRepository = AppDataSource.getRepository(Companies)
        const branchRepository = AppDataSource.getRepository(CompanyBranches)
        const employerRepository = AppDataSource.getRepository(EmployersEntity)
        
        let employerData = await employerRepository.findOneBy({ employer_phone: value.derectorPhone, employer_position: 1 })
        if (employerData !== null) throw new Error(`Bu "${value.derectorPhone}" nomerdan foydalana olmaysiz band qilingan`)
        
        let companyData = await companyRepository.findOneBy({ company_name: value.companyName })
        if (companyData !== null) throw new Error(`"${value.companyName}" nomidan foydalana olmaysiz band qilingan`)
        
        let branchData = await branchRepository.findOneBy({ company_branch_phone: value.companyPhone })
        if (branchData !== null) throw new Error(`"${value.companyPhone}" nomidan foydalana olmaysiz band qilingan`)
        
        let company = new Companies()
        company.company_name = value.companyName
        let companyId = await companyRepository.save(company)
        
        
        let branch = new CompanyBranches()
        branch.company_branch_phone = value.companyPhone
        branch.company_branch_subdomen = value.companyName.replace(/([1234567890]|[\s]|[~`!@#$%^&*()_+{}:";'])/g, "").toLowerCase()
        branch.branch_district_id = value.districtId
        branch.branch_company_id = companyId.company_id
        
        let newBranch = await branchRepository.save(branch)
        console.log(11, newBranch);
        
        
        let employer = new EmployersEntity()
        employer.employer_name = value.derectorName
        employer.employer_phone = value.derectorPhone
        employer.employer_position = 1
        employer.employer_branch_id = newBranch.company_branch_id,
        employer.employer_password = value.password
        
        let newEmployer = await employerRepository.save(employer)
        let payload = {
            branchId: newEmployer.employer_branch_id,
            colleagueId: newEmployer.employer_id,
            role: positionIndicator(newEmployer.employer_position)
        }
        // console.log(payload, newEmployer);
        
        res.json({ data: {
            token: sign(payload),
            redirect_link: `http://${newBranch?.company_branch_subdomen}.localhost:3000/`,
            role: positionIndicator(newEmployer.employer_position)
        }, error: null })
    } catch (error: unknown) {
        res.status(400).json({ data: null, error: (error as Error).message})
    }
}
