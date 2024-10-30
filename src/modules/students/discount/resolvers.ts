import { AddDiscountInput, Discount, RemoveGroupDiscountInput } from "../../../types/discount";
import AppDataSource from "../../../config/ormconfig";
import StudentGroups from "../../../entities/student/student_groups.entity";

const resolvers = {
    Query: {
        groupDiscounts: async (_parent: unknown, { groupId }: { groupId: string }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;

            try {
                const studentDiscountRepository = AppDataSource.getRepository(StudentGroups)
                let studentData = await studentDiscountRepository.find({
                    relations: ['student'],
                    where: { group_id: groupId }
                })
                return studentData
            } catch (error) {
                await catchErrors(error, 'groupDiscounts', branchId);
                throw error;
            }
        }
    },
    Mutation: {
        addGroupDiscount: async (_parent: unknown, { input }: { input: AddDiscountInput }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;

            try {
                const studentDiscountRepository = AppDataSource.getRepository(StudentGroups)
                let studentData = await studentDiscountRepository.findOne({
                    relations: ['student'],
                    where: { group_id: input.groupId, student_id: input.studentId }
                })

                if (!studentData) throw new Error("Guruhda bunaqa uquvchi uqimaydi");

                studentData.student_group_discount = input.discountAmount
                studentData.student_group_discount_type = input.discountType
                studentData.student_group_discount_start = new Date(input.discountStartDate)
                studentData.student_group_discount_end = new Date(input.discountEndDate)
                let savedData = await studentDiscountRepository.save(studentData)
                return savedData
            } catch (error) {
                await catchErrors(error, 'addGroupDiscount', branchId, input);
                throw error;
            }
        },
        removeGroupDiscount: async (_parent: unknown, { input }: { input: RemoveGroupDiscountInput }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;

            try {
                const studentDiscountRepository = AppDataSource.getRepository(StudentGroups)
            let studentData = await studentDiscountRepository.findOne({
                relations: ['student'],
                where: { group_id: input.groupId, student_id: input.studentId }
            })
            if (!studentData) throw new Error("Guruhda bunaqa uquvchi uqimaydi");

            studentData.student_group_discount = 0
            studentData.student_group_discount_type = 1
            studentData.student_group_discount_start = null
            studentData.student_group_discount_end = null
            let savedData = await studentDiscountRepository.save(studentData)
            return savedData
            } catch (error) {
                await catchErrors(error,'removeGroupDiscount', branchId, input);
                throw error;
            }

            
        }
    },
    GroupDiscount: {
        studentId: (global: Discount) => global.student_id,
        studentName: (global: Discount) => global?.student?.student_name,
        studentPhone: (global: Discount) => global?.student?.student_phone,
        groupId: (global: Discount) => global.group_id,
        discountAmount: (global: Discount) => global.student_group_discount,
        discountType: (global: Discount) => global.student_group_discount_type,
        discountStartDate: (global: Discount) => global.student_group_discount_start,
        discountEndDate: (global: Discount) => global.student_group_discount_end,
    }
}

export default resolvers;