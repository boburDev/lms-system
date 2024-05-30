import { AddStudentGroupInput } from "../../../types/groups";
import AppDataSource from "../../../config/ormconfig";
import Student_groups from "../../../entities/student/student_groups.entity";

const resolvers = {
    Mutation: {
        addStudentGroup: async (_parent: unknown, { input }: { input: AddStudentGroupInput }, context: any) => {
            console.log(input)
            if (!context?.branchId) throw new Error("Not exist access token!");
            const studentGroupRepository = AppDataSource.getRepository(Student_groups)

            let data = await studentGroupRepository.findOneBy({ student_id: input.studentId, group_id: input.groupId })
            if (data !== null) throw new Error(`Bu gruppada uquvchi uqimoqda`)
            
            let studentGroup = new Student_groups()
            studentGroup.student_group_add_time = new Date(input.addedDate)
            studentGroup.student_id = input.studentId
            studentGroup.group_id = input.groupId

        }
    },
}

export default resolvers;