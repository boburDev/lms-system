import { AddStudentGroupInput, ChangeStudentGroupDateInput, DeleteStudentGroupInput, FreezeStudentGroupInput, UpdateStudentAddedGroupDateInput } from "../../../types/group";
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
                new Date(dataGroup.group_start_date).getTime() >= new Date(input.addedDate).getTime() ||
                new Date(dataGroup.group_end_date).getTime() <= new Date(input.addedDate).getTime()
            ) throw new Error("Gruppani boshlanish yoki tugash vaqtiga siz tablagan kun bilan tugri kelmadi!")
            
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
        },
        freezeStudentGroup: async (_parent: unknown, { input }: { input: FreezeStudentGroupInput }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const GroupRepository = AppDataSource.getRepository(Groups)
            let dataGroup = await GroupRepository.findOneBy({ group_id: input.groupId })
            if (!dataGroup) throw new Error("Gruppa mavjud emas");
            const studentGroupRepository = AppDataSource.getRepository(Student_groups)
            let studentGroup = await studentGroupRepository.findOneBy({ student_id: input.studentId, group_id: input.groupId })
            if (!studentGroup) throw new Error(`Bu uquvchi not found`)
            studentGroup.student_group_status = 4
            await studentGroupRepository.save(studentGroup)
            return 'success'
        },
        updateStudentAddedGroupDate: async (_parent: unknown, { input }: { input: UpdateStudentAddedGroupDateInput }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const GroupRepository = AppDataSource.getRepository(Groups)
            let dataGroup = await GroupRepository.findOneBy({ group_id: input.groupId })
            if (!dataGroup) throw new Error("Gruppa mavjud emas");
            if (
                new Date(dataGroup.group_start_date) >= new Date(input.addedDate) ||
                new Date(dataGroup.group_end_date) <= new Date(input.addedDate)
            ) throw new Error("Gruppani boshlanish yoki tugash vaqtiga siz tablagan kun bilan tugri kelmadi!")

            await AppDataSource.createQueryBuilder()
                .delete()
                .from(Student_attendences)
                .where(`student_attendence_student_id = :studentId`, {studentId: input.studentId})
                .execute();
                
            await AppDataSource.createQueryBuilder()
                .delete()
                .from(Student_groups)
                .where(`student_id = :studentId`, { studentId: input.studentId })
                .execute();

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
        },
        changeStudentGroup: async (_parent: unknown, { input }: { input: ChangeStudentGroupDateInput }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const GroupRepository = AppDataSource.getRepository(Groups)
            let dataGroup = await GroupRepository.findOneBy({ group_id: input.fromGroupId })
            if (!dataGroup) throw new Error("Gruppa mavjud emas");

            let dataToGroup = await GroupRepository.findOneBy({ group_id: input.toGroupId })
            if (!dataToGroup) throw new Error("O'quvchini qushmoqchi bo'lgan gruppa mavjud emas");

            if (
                new Date(dataToGroup.group_start_date).getTime() > new Date(input.addedDate).getTime() ||
                new Date(dataToGroup.group_end_date).getTime() < new Date(input.addedDate).getTime()
            ) throw new Error("Gruppani boshlanish yoki tugash vaqtiga siz tablagan kun bilan tugri kelmadi!")

            const studentGroupRepository = AppDataSource.getRepository(Student_groups)
            let studentOldAttendance = await studentGroupRepository.findOneBy({ student_id: input.studentId, group_id: input.fromGroupId })
            if (!studentOldAttendance) throw new Error("student group not found");
            
            let today = new Date()
            today.setHours(0, 0, 0, 0)
            let date = { startDate: today, endDate: new Date(dataGroup.group_end_date) }
            let fromToday = input.fromToday ? '>=' : '>'
            await AppDataSource.createQueryBuilder()
                .delete()
                .from(Student_attendences)
                .where(`student_attendence_day ${fromToday} :startDate`, date)
                .andWhere(`student_attendence_day <= :endDate`, date)
                .andWhere(`student_attendence_student_id = :studentId`, {studentId: input.studentId})
                .execute();
            studentOldAttendance.student_group_status = 3
            await studentGroupRepository.save(studentOldAttendance)

            let studentGroup = new Student_groups()
            studentGroup.student_group_add_time = new Date(input.addedDate)
            studentGroup.student_id = input.studentId
            studentGroup.group_id = input.toGroupId
            let newStudentGroup = await studentGroupRepository.save(studentGroup)

            const days = getDays(new Date(input.addedDate), dataToGroup.group_end_date)
            const groupAttendenceRepository = AppDataSource.getRepository(Student_attendences)

            for (const i of days) {
                let studentAttendence = new Student_attendences()
                studentAttendence.student_attendence_group_id = dataToGroup.group_id
                studentAttendence.student_attendence_student_id = input.studentId
                studentAttendence.student_attendence_day = i
                await groupAttendenceRepository.save(studentAttendence);
            }
            return 'succeed'
        },
        deleteStudentGroup: async (_parent: unknown, { input }: { input: DeleteStudentGroupInput }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");

            const GroupRepository = AppDataSource.getRepository(Groups)
            let dataGroup = await GroupRepository.findOneBy({ group_id: input.groupId })
            if (!dataGroup) throw new Error("Gruppa mavjud emas");

            const studentGroupRepository = AppDataSource.getRepository(Student_groups)
            let studentOldAttendance = await studentGroupRepository.findOneBy({ student_id: input.studentId, group_id: dataGroup.group_id })
            if (!studentOldAttendance) throw new Error("student group not found");

            let today = new Date()
            today.setHours(0, 0, 0, 0)
            let date = { startDate: today, endDate: new Date(dataGroup.group_end_date) }
            await AppDataSource.createQueryBuilder()
                .delete()
                .from(Student_attendences)
                .where(`student_attendence_day >= :startDate`, date)
                .andWhere(`student_attendence_day <= :endDate`, date)
                .andWhere(`student_attendence_student_id = :studentId`, { studentId: input.studentId })
                .execute();

            studentOldAttendance.student_group_status = 3
            await studentGroupRepository.save(studentOldAttendance)

            // await AppDataSource.createQueryBuilder()
            //     .delete()
            //     .from(Student_attendences)
            //     .where(`student_attendence_student_id = :studentId`, { studentId: input.studentId })
            //     .execute();

            // await AppDataSource.createQueryBuilder()
            //     .delete()
            //     .from(Student_groups)
            //     .where(`student_id = :studentId`, { studentId: input.studentId })
            //     .execute();
            return 'success'
        }
    },
}

export default resolvers;