import { AddStudentGroupInput } from "../../../types/groups";
import AppDataSource from "../../../config/ormconfig";
import Student_groups, { Student_attendences } from "../../../entities/student/student_groups.entity";
import Groups from "../../../entities/group/groups.entity";
import { getDays } from "../../../utils/date";

const resolvers = {
    Mutation: {
        addStudentGroup: async (_parent: unknown, { input }: { input: AddStudentGroupInput }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const GroupRepository = AppDataSource.getRepository(Groups)
            let dataGroup = await GroupRepository.findOneBy({ group_id: input.groupId })
            if (!dataGroup) throw new Error("Gruppa mavjud emas");
            if (
                new Date(dataGroup.group_start_date) > new Date(input.addedDate) ||
                new Date(dataGroup.group_end_date) < new Date(input.addedDate)
            ) throw new Error("Gruppani tugash vaqti qushilish vaqtidan kichkina!")
            
            const studentGroupRepository = AppDataSource.getRepository(Student_groups)
            let data = await studentGroupRepository.findOneBy({ student_id: input.studentId, group_id: input.groupId })
            if (data !== null) throw new Error(`Bu gruppada uquvchi uqimoqda`)
            
            let studentGroup = new Student_groups()
            studentGroup.student_group_add_time = new Date(input.addedDate)
            studentGroup.student_id = input.studentId
            studentGroup.group_id = input.groupId
            await studentGroupRepository.save(studentGroup)
            
            const days = getDays(new Date(input.addedDate), dataGroup.group_end_date)
            const groupAttendenceRepository = AppDataSource.getRepository(Student_attendences)

            for (const i of days) {
                let studentAttendence = new Student_attendences()
                studentAttendence.student_attendence_group_id = dataGroup.group_id
                studentAttendence.student_attendence_student_id = input.studentId
                studentAttendence.student_attendence_day = i
                await groupAttendenceRepository.save(studentAttendence);
            }
            return 'succeed'
        }
    },
}

export default resolvers;