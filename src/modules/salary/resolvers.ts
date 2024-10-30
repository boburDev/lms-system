import AppDataSource from "../../config/ormconfig";
import SalaryEntity from "../../entities/employer/salary.entity";
import { Salary, UpdateSalaryInput } from "../../types/salary";
import { pubsub } from "../../utils/pubSub";

const resolvers = {
    Query: {
        salary: async (_parametr: unknown, { }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;

            try {
                const salaryRepository = AppDataSource.getRepository(SalaryEntity)

                let data = await salaryRepository.createQueryBuilder("salary")
                    .leftJoinAndSelect("salary.employers", "employer")
                    .where("salary.salary_history_branch_id = :branchId", { branchId: context.branchId })
                    .andWhere("salary.salary_deleted IS NULL")
                    .orderBy("salary.salary_created", "DESC")
                    .getMany();
                return {
                    Salary: data,
                    sum: 0
                }
            } catch (error) {
                await catchErrors(error, 'salary', branchId);
                throw error;
            }
        }
    },
    Mutation: {
        updateSalary: async (_parent: unknown, { input }: { input: UpdateSalaryInput }, context: any): Promise<SalaryEntity | null> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId

            try {
                const salaryRepository = AppDataSource.getRepository(SalaryEntity)

                let data = await salaryRepository.createQueryBuilder("salary")
                    .where("salary.salary_id = :Id", { Id: input.salaryId })
                    .andWhere("salary.salary_deleted IS NULL")
                    .getOne()
                if (!data) throw new Error(`Employer salary not found`)

                data.salary_amount = input.salaryAmount
                data.salary_type = input.salaryType
                data = await salaryRepository.save(data)
                return data
            } catch (error) {
                await catchErrors(error, 'updateSalary', branchId, input);
                throw error;
            }


        }
    },
    Salary: {
        salaryId: (global: Salary) => global.salary_id,
        colleagueId: (global: Salary) => global?.employer.employer_id,
        colleagueName: (global: Salary) => global?.employer.employer_name,
        salaryAmount: (global: Salary) => global.salary_amount,
        salaryType: (global: Salary) => global.salary_type,
    }
}

export default resolvers;