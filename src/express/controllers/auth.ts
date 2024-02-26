import { Request, Response } from 'express'
import { validateObjectSignup } from '../../utils/validation'
import { Companies, CompanyBranches } from '../../entities/company.entity'
import EmployersEntity from '../../entities/employers.entity'
import AppDataSource from '../../config/ormconfig'
import { sign } from '../../utils/jwt'

export const login = async (req:Request, res: Response) => {
    try {
        const { phone_number, password } = req.body
        
        const employerRepository = AppDataSource.getRepository(EmployersEntity)
        let employerData = await employerRepository.findOneBy({ employer_phone: phone_number, employer_password: '' })
        console.log(employerData)
        
        
        console.log(phone_number, password)
        
        res.json({data: 'success'})
    } catch (error) {
        console.log('Login error:', error)
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
        branch.branch_region_id = value.regionId
        branch.branch_company_id = companyId.company_id
        let newBranch = await branchRepository.save(branch)
        
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
            role: newEmployer.employer_position
        }
        console.log(payload, newEmployer);
        
        res.json({ data: {
            token: sign(payload)
        }, error: null })
    } catch (error: unknown) {
        res.status(400).json({ data: null, error: (error as Error).message})
    }
}
