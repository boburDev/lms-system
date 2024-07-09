import { TokenData } from '../types/verifyToken'
import { verify } from './jwt'
import AppDataSource from "../config/ormconfig";
import EmployersEntity from '../entities/employer/employers.entity';
import { authentification } from './authentification';

export const context = async ({ req }: any) => {
    try {
        const { token } = req.headers
        if (!token) {
            throw new Error("Token does not exist")
        } else {
            let tokenDate: TokenData | null = verify(token)
            // console.log(tokenDate, await authentification(token))
            if (!tokenDate) {
                throw new Error("Invalid token")
            }  else {
                const employerRepository = AppDataSource.getRepository(EmployersEntity)

                let data = await employerRepository.createQueryBuilder("employer")
                    .where("employer.employer_id = :Id", { Id: tokenDate?.colleagueId })
                    .andWhere("employer.employer_branch_id = :id", { id: tokenDate?.branchId })
                    .andWhere("employer.employer_deleted IS NULL")
                    .getOne()
                if (!data && !(tokenDate && tokenDate.adminId)) {
                    throw new Error("This user not found")
                }
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