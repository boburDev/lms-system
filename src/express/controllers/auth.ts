import { Request, Response } from 'express'
import { sign } from '../../utils/jwt'
import { validateObjectSignup } from '../../utils/validation'
import { Companies, CompanyBranches } from '../../entities/company.entity'
import EmployersEntity from '../../entities/employers.entity'
import AppDataSource from '../../config/ormconfig'

export const login = async (req:Request, res: Response) => {
    try {
        const { username, password } = req.body
        
        console.log(username, password)
        
        res.json({data: 'success'})
    } catch (error) {
        console.log('Login error:', error)
    }
}

export const signup = async (req:Request, res: Response) => {
    try {
        const { error, value } = validateObjectSignup(req.body)
        
        if (error?.message) throw new Error(error.message);
        
        let company = new Companies()
        company.company_name = value.companyName
        
        const companyRepository = AppDataSource.getRepository(Companies)
        let companyId = (await companyRepository.save(company)).company_id
        
        let branch = new CompanyBranches()
        branch.company_branch_phone = value.companyPhone
        branch.company_branch_subdomen = value.companyName.toLowerCase().trim().split(' ').join('')
        branch.branch_region_id = value.regionId
        branch.branch_company_id = companyId
        
        const branchRepository = AppDataSource.getRepository(CompanyBranches)
        let newBranch = await branchRepository.save(branch)
        
        let employer = new EmployersEntity()
        employer.employer_name = value.derectorName
        employer.employer_phone = value.derectorPhone
        employer.employer_position = 1
        employer.employer_branch_id = newBranch.company_branch_id,
        employer.employer_password = value.password
        
        const employerRepository = AppDataSource.getRepository(EmployersEntity)
        let newEmployer = await employerRepository.save(employer)
        console.log(newEmployer)
        
        res.json({data: 'success'})
    } catch (error) {
        console.log(error)
    }
}
