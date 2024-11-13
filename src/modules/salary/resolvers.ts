import { IsNull } from "typeorm";
import AppDataSource from "../../config/ormconfig";
import SalaryEntity from "../../entities/employer/salary.entity";
import { Salary, UpdateSalaryInput } from "../../types/salary";
import { getChanges } from "../../utils/eventRecorder";
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
            const branchId = context.branchId;
            const writeActions = context.writeActions;
        
            try {
                const salaryRepository = AppDataSource.getRepository(SalaryEntity);
        
                // Find the salary entry to update
                const salary = await salaryRepository.findOne({ where: { salary_id: input.salaryId, salary_deleted: IsNull() } });
                if (!salary) throw new Error("Employer salary not found");
        
                // Preserve original values for change logging
                const originalSalary = { ...salary };
        
                // Update salary fields
                salary.salary_amount = input.salaryAmount;
                salary.salary_type = input.salaryType;
        
                // Save updated salary entry
                const updatedSalary = await salaryRepository.save(salary);
        
                // Track changes for logging
                const salaryChanges = getChanges(originalSalary, updatedSalary, ["salary_amount", "salary_type"]);
                for (const change of salaryChanges) {
                    await writeActions({
                        objectId: updatedSalary.salary_id,
                        eventType: 2,  // Assuming 2 represents "update" actions
                        eventBefore: change.before,
                        eventAfter: change.after,
                        eventObject: "Salary",
                        eventObjectName: change.field,
                        employerId: context.colleagueId,
                        employerName: context.colleagueName,
                        branchId: branchId
                    });
                }
        
                return updatedSalary;
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