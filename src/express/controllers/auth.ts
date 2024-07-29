import { Request, Response } from 'express'
import { validateObjectNewPassword, validateObjectSignup } from '../../utils/validation'
import { Companies, CompanyBranches } from '../../entities/company/company.entity'
import EmployersEntity from '../../entities/employer/employers.entity'
import AppDataSource from '../../config/ormconfig'
import { sign } from '../../utils/jwt'
import { comparePassword } from '../../utils/bcrypt'
import { IsNull } from 'typeorm'
import positionIndicator from '../../utils/status_and_positions'
import BranchActivityEntity from '../../entities/company/company_activity.entity'
import { ESKIZ_TOKEN } from '../../config/config'
import ForgetPasswordEntity from '../../entities/options/forget_password.entity'
import PhoneEntity from '../../entities/options/phone.entity'

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

export const verifyPhoneBeforeCreateAccaunt = async (req: Request, res: Response) => {
    try {
        const { userphone } = req.body

        if (!(userphone)) throw new Error("Invalid input value");
        
        const employerRepository = AppDataSource.getRepository(EmployersEntity)
        let employerData = await employerRepository.findOneBy({ employer_phone: userphone, employer_position: 1 })
        if (!employerData) throw new Error(`Bu "${userphone}" nomerdan foydalana olmaysiz band qilingan`)

        const code = Math.floor(100000 + Math.random() * 900000)

        const payload = {
            mobile_phone: userphone,
            message: `Verification password: ${code}`,
            from: '4546'
        }

        const response = await fetch('https://notify.eskiz.uz/api/message/sms/send', {
            method: 'POST',
            headers: {
                Authorization: ESKIZ_TOKEN,
                // fetch will automatically set the correct Content-Type for FormData
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.id) {
            const phoneRepository = AppDataSource.getRepository(PhoneEntity)
            let phone = await phoneRepository.createQueryBuilder("phone")
                .where("phone.phone_number = :userphone", { userphone })
                .getOne()

            if (phone) {
                phone.temp_code = code;
                phone.phone_code_created = new Date(Date.now() + 2 * 60 * 1000);
            } else {
                let phone = new PhoneEntity()
                phone.temp_code = code;
                phone.phone_number = userphone
                await phoneRepository.save(phone);
            }
            res.json({ data: 'success', error: null })
        }
    } catch (error: unknown) {
        res.status(400).json({ data: null, error: (error as Error).message })
    }
}

export const signup = async (req:Request, res: Response) => {
    try {
        const { error, value } = validateObjectSignup(req.body)
        if (error?.message) throw new Error(error.message)

        const phoneRepository = AppDataSource.getRepository(PhoneEntity)
        let phone = await phoneRepository.createQueryBuilder("phone")
            .where("phone.phone_number = :phone", { phone: value.derectorPhone })
            .getOne()
        if (!phone) throw new Error("Time expired");

        const timeExpire = phone.phone_code_created.getTime() - new Date().getTime() > 0;
        if (!(phone.temp_code === (+value.code) && timeExpire)) throw new Error("Time expired"); 

        const companyRepository = AppDataSource.getRepository(Companies)
        const branchRepository = AppDataSource.getRepository(CompanyBranches)
        const employerRepository = AppDataSource.getRepository(EmployersEntity)
        const activityRepository = AppDataSource.getRepository(BranchActivityEntity)
        
        let employerData = await employerRepository.findOneBy({ employer_phone: value.derectorPhone, employer_position: 1 })
        if (!employerData) throw new Error(`Bu "${value.derectorPhone}" nomerdan foydalana olmaysiz band qilingan`)
        
        let companyData = await companyRepository.findOneBy({ company_name: value.companyName })
        if (!companyData) throw new Error(`"${value.companyName}" nomidan foydalana olmaysiz band qilingan`)
        
        let branchData = await branchRepository.findOneBy({ company_branch_phone: value.companyPhone })
        if (!branchData) throw new Error(`"${value.companyPhone}" nomidan foydalana olmaysiz band qilingan`)
        
        let company = new Companies()
        company.company_name = value.companyName
        let companyId = await companyRepository.save(company)

        
        let branch = new CompanyBranches()
        branch.company_branch_name = value.companyName
        branch.company_branch_phone = value.companyPhone
        branch.company_branch_subdomen = value.companyName.replace(/([1234567890]|[\s]|[~`!@#$%^&*()_+{}:";'])/g, "").toLowerCase()
        branch.branch_district_id = value.districtId
        branch.branch_company_id = companyId.company_id
        
        let newBranch = await branchRepository.save(branch)

        let daysToAdd = 7
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + daysToAdd);

        let activity = new BranchActivityEntity()
        activity.group_start_date = startDate
        activity.group_end_date = endDate
        activity.branch_id = newBranch.company_branch_id
        await activityRepository.save(activity)
        
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

export const forgetPassword = async (req: Request, res: Response) => {
    try {
        const { userphone, subdomain } = req.body

        if (!(userphone && subdomain)) throw new Error("Invalid input value");
        
        const employerRepository = AppDataSource.getRepository(EmployersEntity)
        let employer = await employerRepository.createQueryBuilder("employer")
            .leftJoinAndSelect("employer.branches", "branch")
            .where("employer.employer_phone = :userphone", { userphone })
            .andWhere("branch.company_branch_subdomen = :subdomain", { subdomain })
            .andWhere("employer.employer_deleted IS NULL")
            .andWhere("branch.company_branch_deleted IS NULL")
            .andWhere("branch.company_branch_status = true")
            .getOne()

        if (!employer) throw new Error("Phone number not found");
        const code = Math.floor(100000 + Math.random() * 900000)

        const payload = {
            mobile_phone: userphone,
            message: `Verification password: ${code}`,
            from: '4546'
        }

        const response = await fetch('https://notify.eskiz.uz/api/message/sms/send', {
            method: 'POST',
            headers: {
                Authorization: ESKIZ_TOKEN,
                // fetch will automatically set the correct Content-Type for FormData
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.id) {
            const forgetPasswordRepository = AppDataSource.getRepository(ForgetPasswordEntity)
            let forgetPassword = await forgetPasswordRepository.createQueryBuilder("forgetPassword")
                .where("forgetPassword.sender_id = :id", { id: employer.employer_id })
                .getOne()

            if (forgetPassword) {
                forgetPassword.sended_code = code;
                forgetPassword.created_at = new Date(Date.now() + 2 * 60 * 1000);
            } else {
                let forgetPassword = new ForgetPasswordEntity()
                forgetPassword.sended_code = code;
                forgetPassword.sender_id = employer.employer_id;
                await forgetPasswordRepository.save(forgetPassword);
            }
            res.json({ data: 'success', error: null })
        }
    } catch (error: unknown) {
        res.status(400).json({ data: null, error: (error as Error).message })
    }
}

export const updateNewPassword = async (req: Request, res: Response) => {
    try {
        const { error, value } = validateObjectNewPassword(req.body)
        if (error?.message) throw new Error(error.message)
        const { userphone, subdomain, code, new_password } = value

        const employerRepository = AppDataSource.getRepository(EmployersEntity)
        let employer = await employerRepository.createQueryBuilder("employer")
            .leftJoinAndSelect("employer.branches", "branch")
            .where("employer.employer_phone = :userphone", { userphone })
            .andWhere("branch.company_branch_subdomen = :subdomain", { subdomain })
            .andWhere("employer.employer_deleted IS NULL")
            .andWhere("branch.company_branch_deleted IS NULL")
            .andWhere("branch.company_branch_status = true")
            .getOne()

        if (!employer) throw new Error("Phone number not found");
        
        const forgetPasswordRepository = AppDataSource.getRepository(ForgetPasswordEntity)
        let forgetPassword = await forgetPasswordRepository.createQueryBuilder("forgetPassword")
            .where("forgetPassword.sender_id = :id", { id: employer.employer_id })
            .getOne()
        if (!forgetPassword) throw new Error("Time expired");

        const timeExpire = forgetPassword.created_at.getTime() - new Date().getTime() > 0;

        if (forgetPassword.sended_code === (+code) && timeExpire) {
            // colleageModel.updateColleguePass(collegue.study_center_colleague_id, new_password)
            employer.employer_password = new_password
            res.json({ data: 'success', error: null })
        } else {
            throw new Error("Time expired");   
        }
    } catch (error: unknown) {
        res.status(400).json({ data: null, error: (error as Error).message })
    }
}