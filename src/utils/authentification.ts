import AppDataSource from "../config/ormconfig";
import { verify } from './jwt'
import { TokenData } from "../types/verifyToken";
import AdminEntity from "../entities/admin.entity";
import EmployersEntity from "../entities/employer/employers.entity";
import BranchActivityEntity from "../entities/company/company_activity.entity";
import { CompanyBranches } from "../entities/company/company.entity";
import StudentsEntity from "../entities/student/students.entity";
import PricesEntity from "../entities/options/price.entity";
import BranchPaymentHistoryEntity from "../entities/company/company_payment_history.entity";

let branches:any = {};

const activeBranch = async (branchId:string) => {
    const branchRepository = AppDataSource.getRepository(CompanyBranches)
    const studentRepository = AppDataSource.getRepository(StudentsEntity)
    let branchData = await branchRepository.findOneBy({ company_branch_id: branchId })

    if (!branchData) 
        return false

    const count = await studentRepository.createQueryBuilder("students")
        .where("students.student_deleted IS NULL")
        .andWhere("students.student_branch_id = :branchId", { branchId })
        .getCount();

    if (count <= 50)
        return true;

    const priceRepository = AppDataSource.getRepository(PricesEntity)
    let price = await priceRepository.createQueryBuilder("price")
        .where("price.from_count <= :count", { count })
        .andWhere("price.to_count >= :count", { count })
        .getOne() || { price: 1000000 }

    if (branchData.company_branch_balance < price.price) return false;

    branchData.company_branch_balance = branchData.company_branch_balance - price.price
    await branchRepository.save(branchData)
    const paymentHistoryRepository = AppDataSource.getRepository(BranchPaymentHistoryEntity)
    let paymentHistory = new BranchPaymentHistoryEntity()
    paymentHistory.is_payment = false
    paymentHistory.payment_ammount = price.price
    await paymentHistoryRepository.save(paymentHistory)

    let daysToAdd = 30
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + daysToAdd);
    const activityRepository = AppDataSource.getRepository(BranchActivityEntity)
    let activity = new BranchActivityEntity()
    activity.group_start_date = startDate
    activity.group_end_date = endDate
    activity.branch_id = branchId
    await activityRepository.save(activity)
    return true;
}


export const authentification = async (token:string) => {
    try {
        let isActive = true;
        let isAdmin = false;
        let tokenDate: TokenData | null = verify(token)

        if (tokenDate && tokenDate.adminId) {
            const adminRepository = AppDataSource.getRepository(AdminEntity)
            let data = await adminRepository.createQueryBuilder("admin")
                .where("admin.admin_id = :Id", { Id: tokenDate.adminId })
                .andWhere("admin.admin_status = 1")
                .getOne()
            if (!data || data.admin_status < 0) return { isActive: false }
            isAdmin = true
        } else if (tokenDate && tokenDate.branchId && tokenDate.colleagueId) {
            const employerRepository = AppDataSource.getRepository(EmployersEntity)
            const activityRepository = AppDataSource.getRepository(BranchActivityEntity)
            let employer = await employerRepository.createQueryBuilder("employer")
                .where("employer.employer_id = :Id", { Id: tokenDate.colleagueId })
                .andWhere("employer.employer_branch_id = :id", { id: tokenDate.branchId })
                .andWhere("employer.employer_deleted IS NULL")
                .getOne()
            if (!employer) return { isActive: false, isAdmin }

            let activity = await activityRepository.createQueryBuilder("activity")
                .where("activity.branch_activity_status = true")
                .andWhere("activity.branch_id = :id", { id: tokenDate.branchId })
                .getOne()

            if (!activity) {
                isActive = false
            } else if (new Date(activity.group_end_date).getTime() < new Date().getTime()) {
                activity.branch_activity_status = false
                await activityRepository.save(activity)
                isActive = false
            }

            if (!isActive) {
                isActive = await activeBranch(tokenDate.branchId);
            }

            if (isActive && !branches[tokenDate.branchId]) {
                branches[tokenDate.branchId] = true;
            } else if (!isActive && branches[tokenDate.branchId]) {
                branches[tokenDate.branchId] = false;
            }

        }
        return { ...tokenDate, isAdmin, isActive }
    } catch (error) {
        return false
    }
}