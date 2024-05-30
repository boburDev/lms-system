import { AddGroupInput, AddStudentGroupInput, Group } from "../../../types/groups";
import AppDataSource from "../../../config/ormconfig";
import GroupEntity from "../../../entities/group/groups.entity";

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
                    .where("group.group_branch_id = :branchId", { branchId: context.branchId })
                    .andWhere("group.group_id = :groupId", { groupId: input.Id })
                    .andWhere("attendence.group_attendence_day BETWEEN :startDay AND :endDay", date)
                    .getOne();
                
                 if (data) {
                   let days = data.group_days.split(" ") 
                   let attendence = data.attendence
                   let daysResult =attendence.filter(day => {
                    if (days.includes(new Date(day.group_attendence_day).getDay() + '')) {
                        return day
                    }
                   })
                    data.attendence = daysResult
                 }
            }
            return data
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
    }
}

export default resolvers;