import { ActivateStudentGroupInput, AddStudentGroupInput, ChangeStudentGroupDateInput, DeleteStudentGroupInput, FreezeStudentGroupInput, UpdateStudentAddedGroupDateInput } from "../../../types/group";
import AppDataSource from "../../../config/ormconfig";
import StudentGroups, { StudentAttendences } from "../../../entities/student/student_groups.entity";
import GroupEntity, { GroupAttendences } from "../../../entities/group/groups.entity";
import Groups from "../../../entities/group/groups.entity";
import { getDays } from "../../../utils/date";

const resolvers = {
    Mutation: {
        activateStudentGroup: async (_parent: unknown, { input }: { input: ActivateStudentGroupInput }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            let groupRepository = AppDataSource.getRepository(GroupEntity)

            let query = groupRepository.createQueryBuilder("group")
                .leftJoinAndSelect("group.employer", "employer")
                .leftJoinAndSelect("group.course", "course")
                .leftJoinAndSelect("group.student_group", "student_group")
                .leftJoinAndSelect("student_group.student", "student")
                .where("group.group_branch_id = :branchId", { branchId: context.branchId })
                .andWhere("group.group_id = :groupId", { groupId: input.groupId })
                .andWhere("student_group.student_group_status = 4")
                .andWhere("group.group_deleted IS NULL")
                .andWhere("student.student_deleted IS NULL");
            if (input.studentId) {
                query = query.andWhere("student.student_id = :studentId", { studentId: input.studentId });
            }
            let data = await query.getOne();
            if (!data) throw new Error("User is already activated or Group not found");
            // console.log(data)
            
            let groupDays = data.group_days
            let groupStudents = data.student_group
            let today = new Date()
            const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            let daysInMonth = getDays(startDate, endDate)
            let coursePrice = data.course.course_price || 0
            let endIndex = 0
            let daysResult = daysInMonth.filter(day => {
                if (groupDays.includes(String(day.getDay()))) {
                    if (today.getDate() <= (data?.group_end_date?.getDate() || 0)) endIndex++
                    return day
                }
            })
            const lessonCount = daysResult.length
            const oneDayPrice = coursePrice / lessonCount
            let studyDay = 0

            for (const student of groupStudents) {

                for (let i = 0; i < lessonCount; i++) {
                    if (daysResult[i].getDate() >= student.student_group_add_time.getDate()) {
                        studyDay = lessonCount - i - (lessonCount - endIndex);
                        break;
                    }
                }
                let price = Math.round(oneDayPrice * studyDay / 1000) * 1000;
                const saleType = student.student_group_discount_type == 1 ? 'cash' : 'percent'
                if (student && student?.student_group_discount_start && student?.student_group_discount_end) {
                    let checkDate1 = student.student_group_discount_start.getDate() <= today.getDate()
                    let checkDate2 = student.student_group_discount_end.getDate() >= today.getDate()
                    if (checkDate1 && checkDate2) {
                        if (saleType == 'cash') {
                            let oneDayPriceWithSale = oneDayPrice - (student.student_group_discount / lessonCount);
                            price = (Math.round(oneDayPriceWithSale * studyDay / 1000) * 1000);
                        } else {
                            let oneDayPriceWithSale = oneDayPrice - (oneDayPrice * student.student_group_discount / 100);
                            price = Math.round(oneDayPriceWithSale * studyDay / 1000) * 1000;
                        }
                    } else if (checkDate2) {
                        let daysInDates = getDays(student.student_group_discount_start, student.student_group_discount_end)
                        let daysResultInDates = daysInDates.filter(day => {
                            if (groupDays.includes(String(day.getDay()))) {
                                return day
                            }
                        })
                        const lessonCountInDates = daysResultInDates.length
                        if (saleType == 'cash') {
                            let oneDayPriceWithSale = student.student_group_discount / lessonCount;
                            price = (Math.round(oneDayPrice * studyDay / 1000) * 1000) - (oneDayPriceWithSale * lessonCountInDates);
                        } else {
                            let oneDayPriceWithSale = coursePrice * student.student_group_discount / lessonCount / 100;
                            price = (Math.round(oneDayPrice * studyDay / 1000) * 1000) - (oneDayPriceWithSale * lessonCountInDates);;
                        }
                    }
                    
                }
                price = Math.round(price)
                // const sale = await model.groupSaleStudent(student, groupID);
                console.log(studyDay, price, saleType, student.student_group_discount, coursePrice, lessonCount);
                // const data = await cashModel.studentCash(student);

                
            }
            // console.log(daysInMonth.length);
            // console.log(data)


            if (input.studentId && input.groupId) {

            } else if (input.groupId) {

            }

        },
        addStudentGroup: async (_parent: unknown, { input }: { input: AddStudentGroupInput }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const GroupRepository = AppDataSource.getRepository(Groups)
            let dataGroup = await GroupRepository.findOneBy({ group_id: input.groupId })
            if (!dataGroup) throw new Error("Gruppa mavjud emas");
            if (
                new Date(dataGroup.group_start_date).getTime() >= new Date(input.addedDate).getTime() ||
                new Date(dataGroup.group_end_date).getTime() <= new Date(input.addedDate).getTime()
            ) throw new Error("Gruppani boshlanish yoki tugash vaqtiga siz tablagan kun bilan tugri kelmadi!")

            const studentGroupRepository = AppDataSource.getRepository(StudentGroups)
            let data = await studentGroupRepository.findOneBy({ student_id: input.studentId, group_id: input.groupId })
            if (data !== null) throw new Error(`Bu gruppada uquvchi uqimoqda`)

            let studentGroup = new StudentGroups()
            studentGroup.student_group_add_time = new Date(input.addedDate)
            studentGroup.student_group_lesson_end = dataGroup.group_end_date
            studentGroup.student_id = input.studentId
            studentGroup.group_id = input.groupId
            studentGroup.student_group_status = 4
            await studentGroupRepository.save(studentGroup)

            const days = getDays(new Date(input.addedDate), dataGroup.group_end_date)
            const groupAttendenceRepository = AppDataSource.getRepository(StudentAttendences)

            for (const i of days) {
                let studentAttendence = new StudentAttendences()
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
            const studentGroupRepository = AppDataSource.getRepository(StudentGroups)
            let studentGroup = await studentGroupRepository.findOneBy({ student_id: input.studentId, group_id: input.groupId })
            if (!studentGroup) throw new Error(`Bu uquvchi not found`)
            studentGroup.student_group_status = 10
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
                .from(StudentAttendences)
                .where(`student_attendence_student_id = :studentId`, { studentId: input.studentId })
                .execute();

            await AppDataSource.createQueryBuilder()
                .delete()
                .from(StudentGroups)
                .where(`student_id = :studentId`, { studentId: input.studentId })
                .execute();

            const studentGroupRepository = AppDataSource.getRepository(StudentGroups)
            let data = await studentGroupRepository.findOneBy({ student_id: input.studentId, group_id: input.groupId })
            if (data !== null) throw new Error(`Bu gruppada uquvchi uqimoqda`)

            let studentGroup = new StudentGroups()
            studentGroup.student_group_add_time = new Date(input.addedDate)
            studentGroup.student_id = input.studentId
            studentGroup.group_id = input.groupId
            await studentGroupRepository.save(studentGroup)

            const days = getDays(new Date(input.addedDate), dataGroup.group_end_date)
            const groupAttendenceRepository = AppDataSource.getRepository(StudentAttendences)

            for (const i of days) {
                let studentAttendence = new StudentAttendences()
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

            const studentGroupRepository = AppDataSource.getRepository(StudentGroups)
            let studentOldAttendance = await studentGroupRepository.findOneBy({ student_id: input.studentId, group_id: input.fromGroupId })
            if (!studentOldAttendance) throw new Error("student group not found");

            const checkStatus = studentOldAttendance.student_group_status == 4 ? true : false
            let today = new Date()
            today.setHours(0, 0, 0, 0)
            let date = { startDate: today, endDate: new Date(dataGroup.group_end_date) }
            let fromToday = input.fromToday ? '>=' : '>'
            await AppDataSource.createQueryBuilder()
                .delete()
                .from(StudentAttendences)
                .where(`student_attendence_day ${fromToday} :startDate`, date)
                .andWhere(`student_attendence_day <= :endDate`, date)
                .andWhere(`student_attendence_student_id = :studentId`, { studentId: input.studentId })
                .execute();
            studentOldAttendance.student_group_status = checkStatus ? 7 : 6
            studentOldAttendance.student_left_group_time = new Date()
            await studentGroupRepository.save(studentOldAttendance)

            let studentGroup = new StudentGroups()
            studentGroup.student_group_add_time = new Date(input.addedDate)
            studentGroup.student_id = input.studentId
            studentGroup.group_id = input.toGroupId
            studentGroup.student_group_status = 4
            let newStudentGroup = await studentGroupRepository.save(studentGroup)

            const days = getDays(new Date(input.addedDate), dataToGroup.group_end_date)
            const groupAttendenceRepository = AppDataSource.getRepository(StudentAttendences)

            for (const i of days) {
                let studentAttendence = new StudentAttendences()
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

            const studentGroupRepository = AppDataSource.getRepository(StudentGroups)
            let studentOldAttendance = await studentGroupRepository.findOneBy({ student_id: input.studentId, group_id: dataGroup.group_id })
            if (!studentOldAttendance) throw new Error("student group not found");

            const checkStatus = studentOldAttendance.student_group_status == 4 ? true : false

            let today = new Date()
            today.setHours(0, 0, 0, 0)
            let date = { startDate: today, endDate: new Date(dataGroup.group_end_date) }
            await AppDataSource.createQueryBuilder()
                .delete()
                .from(StudentAttendences)
                .where(`student_attendence_day >= :startDate`, date)
                .andWhere(`student_attendence_day <= :endDate`, date)
                .andWhere(`student_attendence_student_id = :studentId`, { studentId: input.studentId })
                .execute();

            studentOldAttendance.student_group_status = checkStatus ? 7 : 6
            studentOldAttendance.student_left_group_time = new Date()
            await studentGroupRepository.save(studentOldAttendance)

            // await AppDataSource.createQueryBuilder()
            //     .delete()
            //     .from(StudentAttendences)
            //     .where(`student_attendence_student_id = :studentId`, { studentId: input.studentId })
            //     .execute();
            // await AppDataSource.createQueryBuilder()
            //     .delete()
            //     .from(StudentGroups)
            //     .where(`student_id = :studentId`, { studentId: input.studentId })
            //     .execute();
            return 'success'
        }
    },
}

export default resolvers;