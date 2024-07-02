import { TokenData } from '../types/verifyToken'
import { verify } from './jwt'
import AppDataSource from "../config/ormconfig";
import EmployersEntity from '../entities/employer/employers.entity';

export const context = async ({ req }: any) => {
    try {
        const { token } = req.headers
        
        if (!token) {
            return ''
        } else {
            let tokenDate: TokenData | null = verify(token)
            const employerRepository = AppDataSource.getRepository(EmployersEntity)

            let data = await employerRepository.createQueryBuilder("employer")
                .where("employer.employer_id = :Id", { Id: tokenDate?.colleagueId })
                .andWhere("employer.employer_branch_id = :id", { id: tokenDate?.branchId })
                .andWhere("employer.employer_deleted IS NULL")
                .getOne()

            if (!tokenDate || !data) {
                throw new Error("Invalid token")
            }
            return tokenDate
        }
            
        
    } catch (error: unknown) {
        let message = (error as Error).message
        // if (message === 'No token') {
        // } else if (false) {
            
        // } else {
        // }
        throw new Error(message)
    }


}