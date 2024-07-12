import { AddGroupInput, AddStudentGroupInput, Group } from "../../../types/group";
import AppDataSource from "../../../config/ormconfig";
import GroupEntity, { Group_attendences } from "../../../entities/group/groups.entity";
import { updateGroupAttendanceStatus, updateStudentAttendenceStatus } from "../../../types/attendance";
import { Student_attendences } from "../../../entities/student/student_groups.entity";

const resolvers = {
    Query: {
        groupAttendenceByIdOrDate: async (_parametr: unknown, input: AddGroupInput, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            let groupRepository = AppDataSource.getRepository(GroupEntity)
            let data

            if (input.Id && input.startDate && input.endDate) {
                let date = { startDay: new Date(input.startDate), endDay: new Date(input.endDate) }
				data = await groupRepository.createQueryBuilder("group")
					.leftJoinAndSelect("group.attendence", "attendence")
					.leftJoinAndSelect("group.student_attendences", "student_attendence")
					.leftJoinAndSelect("student_attendence.students", "student")
					.where("group.group_branch_id = :branchId", { branchId: context.branchId })
					.andWhere("group.group_id = :groupId", { groupId: input.Id })
					.andWhere("attendence.group_attendence_day BETWEEN :startDay AND :endDay", date)
					.andWhere("student_attendence.student_attendence_day BETWEEN :startDay AND :endDay", date)
					.orderBy("attendence.group_attendence_day", "ASC")
					.getOne();
                
				if (data) {
					let days = data.group_days.split(" ") 
					let attendence = data.attendence
					let studentAttendence = data.student_attendences
					let daysResult = attendence.filter(day => {
					if (days.includes(new Date(day.group_attendence_day).getDay() + '')) {
						return day
					}
					})
					data.attendence = daysResult

					let daysStudentResult = studentAttendence.filter(day => {
						if (days.includes(new Date(day.student_attendence_day).getDay() + '')) {
							return day
						}
					})
					
					const groupedData = daysStudentResult.reduce((acc:any, curr) => {
						const { student_id, student_name } = curr.students;
						const student_attendance = {
							student_attendence_id: curr.student_attendence_id,
							student_attendence_day: curr.student_attendence_day,
							student_attendence_status: curr.student_attendence_status,
							student_attendence_group_id: curr.student_attendence_group_id,
							student_attendence_student_id: curr.student_attendence_student_id
						};
						if (!acc[student_id]) {
							acc[student_id] = {
								student_id: student_id,
								student_name: student_name,
								student_days: []
							};
						}
						acc[student_id].student_days.push(student_attendance);
						return acc;
					}, {});
					data.student_attendences = Object.values(groupedData)
				}
            }
            return data
        }
    },
	Mutation: {
		updateStudentAttendanceStatus: async (_parent: unknown, { input }: { input: updateStudentAttendenceStatus }, context: any) => {
			if (!context?.branchId) throw new Error("Not exist access token!");
			let studentAttendanceRepository = AppDataSource.getRepository(Student_attendences)
			let data = await studentAttendanceRepository.findOneBy({ student_attendence_id: input.attendId, student_attendence_group_id: input.groupId })
			if (data === null) throw new Error(`Bu o'quvchining malumotlari mavjud emas`)
			data.student_attendence_status = input.attendStatus
			await studentAttendanceRepository.save(data)
			return 'success'
		},
		updateGroupAttendanceStatus: async (_parent: unknown, { input }: { input: updateGroupAttendanceStatus }, context: any) => {
			if (!context?.branchId) throw new Error("Not exist access token!");
			let groupAttendanceRepository = AppDataSource.getRepository(Group_attendences)
			let data = await groupAttendanceRepository.findOneBy({ group_attendence_id: input.attendId, group_attendence_group_id: input.groupId })
			if (data === null) throw new Error(`Bu guruhning malumotlari mavjud emas`)
			data.group_attendence_status = input.attendStatus
			await groupAttendanceRepository.save(data)
			return 'success'
		}
	},
    GroupAttendence: {
        groupAttendence: (global: Group) => {
          return global.attendence && global.attendence.map(i => {
            return {
              attendId: i.group_attendence_id,
              attendDay: i.group_attendence_day,
              attendStatus: i.group_attendence_status,
              groupId: i.group_attendence_group_id
            }
          })
        },
		studentsAttendence: (global: Group) => {
			return global.student_attendences && global.student_attendences.map(i => {
				let data = i.student_days.map(j => {
					return {
						attendId: j.student_attendence_id,
						attendDay: j.student_attendence_day,
						attendStatus: j.student_attendence_status,
						groupId: j.student_attendence_group_id
					}
				})
				return {
					studentId: i.student_id,
					studentName: i.student_name,
					attendence: data
				}

			})
		}
    }
}

export default resolvers;
