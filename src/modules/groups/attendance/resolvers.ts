import { Group } from "../../../types/group";
import AppDataSource from "../../../config/ormconfig";
import GroupEntity, { GroupAttendences } from "../../../entities/group/groups.entity";
import { updateGroupAttendanceStatus, updateStudentAttendenceStatus } from "../../../types/attendance";
import { StudentAttendences } from "../../../entities/student/student_groups.entity";
import { getChanges } from "../../../utils/eventRecorder";

const resolvers = {
	Query: {
		groupAttendenceByIdOrDate: async (_parametr: unknown, input: { Id: string, month: string }, context: any) => {
			if (!context?.branchId) throw new Error("Not exist access token!");
			const catchErrors = context.catchErrors;
			const branchId = context.branchId;

			try {
				let groupRepository = AppDataSource.getRepository(GroupEntity)
				let data

				if (input.Id && input.month) {
					const filterDate = input.month ? new Date(input.month) : new Date();
					const year = filterDate.getFullYear();
					const month = filterDate.getMonth() + 1;
					const startOfMonthDate = new Date(year, month - 1, 1);
					const endOfMonthDate = new Date(year, month, 0);

					let date = { startDay: startOfMonthDate, endDay: endOfMonthDate }
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

						const groupedData = daysStudentResult.reduce((acc: any, curr) => {
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
			} catch (error) {
				await catchErrors(error, 'groupAttendenceByIdOrDate', branchId);
				throw error;
			}


		}
	},
	Mutation: {
		updateStudentAttendanceStatus: async (_parent: unknown, { input }: { input: updateStudentAttendenceStatus }, context: any) => {
			if (!context?.branchId) throw new Error("Not exist access token!");
			const catchErrors = context.catchErrors;
			const branchId = context.branchId;
			const writeActions = context.writeActions;
		
			try {
				let studentAttendanceRepository = AppDataSource.getRepository(StudentAttendences);
				
				let data = await studentAttendanceRepository.findOneBy({ 
					student_attendence_id: input.attendId, 
					student_attendence_group_id: input.groupId 
				});
				
				if (!data) throw new Error(`Bu o'quvchining malumotlari mavjud emas`);
		
				const originalStatus = { ...data };
				data.student_attendence_status = input.attendStatus;
		
				let updatedStatus = await studentAttendanceRepository.save(data);
		
				// Log the change in attendance status
				const attendanceChanges = getChanges(originalStatus, updatedStatus, ["student_attendence_status"]);
				for (const change of attendanceChanges) {
					await writeActions({
						objectId: updatedStatus.student_attendence_id,
						eventType: 2,
						eventBefore: change.before,
						eventAfter: change.after,
						eventObject: "StudentAttendence",
						eventObjectName: "student_attendence_status",
						employerId: context.colleagueId || "",
						employerName: context.colleagueName || "",
						branchId: context.branchId || ""
					});
				}
		
				return 'success';
			} catch (error) {
				await catchErrors(error, 'updateStudentAttendanceStatus', branchId, input);
				throw error;
			}
		},
		updateGroupAttendanceStatus: async (_parent: unknown, { input }: { input: updateGroupAttendanceStatus }, context: any) => {
			if (!context?.branchId) throw new Error("Not exist access token!");
			const catchErrors = context.catchErrors;
			const branchId = context.branchId;
			const writeActions = context.writeActions;
		
			try {
				let groupAttendanceRepository = AppDataSource.getRepository(GroupAttendences);
				
				let data = await groupAttendanceRepository.findOneBy({ 
					group_attendence_id: input.attendId, 
					group_attendence_group_id: input.groupId 
				});
				
				if (!data) throw new Error(`Bu guruhning malumotlari mavjud emas`);
		
				const originalStatus = { ...data };
				data.group_attendence_status = input.attendStatus;
		
				let updatedStatus = await groupAttendanceRepository.save(data);
		
				// Log the change in group attendance status
				const attendanceChanges = getChanges(originalStatus, updatedStatus, ["group_attendence_status"]);
				for (const change of attendanceChanges) {
					await writeActions({
						objectId: updatedStatus.group_attendence_id,
						eventType: 2,
						eventBefore: change.before,
						eventAfter: change.after,
						eventObject: "GroupAttendence",
						eventObjectName: "group_attendence_status",
						employerId: context.colleagueId || "",
						employerName: context.colleagueName || "",
						branchId: context.branchId || ""
					});
				}
		
				return 'success';
			} catch (error) {
				await catchErrors(error, 'updateGroupAttendanceStatus', branchId, input);
				throw error;
			}
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
