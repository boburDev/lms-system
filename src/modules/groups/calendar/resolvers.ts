import AppDataSource from "../../../config/ormconfig";
import GroupEntity, { GroupAttendences } from "../../../entities/group/groups.entity";

const resolvers = {
    Query: {
        findCalendar: async (_parametr: unknown, input: { startDate: string, endDate: string }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            // console.log(input)
            const groupAttendanceRepository = AppDataSource.getRepository(GroupAttendences)
            const startDate = new Date(input.startDate);
            const endDate = new Date(input.endDate);
            // console.log('Query Start Date:', startDate);
            // console.log('Query End Date:', endDate);
            let data = await groupAttendanceRepository.createQueryBuilder('egt')
                .select([
                    'egt.group_attendence_day as date',
                    'json_agg(egt.*) as group_attendances'
                ])
                .innerJoin('egt.groups', 'eg')
                .where('egt.group_attendence_day >= :startDate', { startDate })
                .andWhere('egt.group_attendence_day <= :endDate', { endDate })
                .andWhere('eg.group_branch_id = :branchId', { branchId: context.branchId })
                .andWhere("eg.group_deleted IS NULL")
                .groupBy('egt.group_attendence_day')
                .getRawMany();
            
            let results = []
            const groupRepository = AppDataSource.getRepository(GroupEntity)

            for (const i of data) {
                let obj: any = {
                    date: i.date,
                    action: []
                }
                for (const j of i.group_attendances) {
                    let group = await groupRepository.createQueryBuilder("group")
                        .leftJoinAndSelect("group.employer", "employer")
                        .leftJoinAndSelect("group.room", "room")
                        .leftJoinAndSelect("group.course", "course")
                        .where("group.group_branch_id = :branchId", { branchId: context.branchId })
                        .andWhere("group.group_id = :groupId", { groupId: j.group_attendence_group_id })
                        .andWhere("group.group_deleted IS NULL")
                        .getOne();
                    let days = group?.group_days.split(" ")
                    
                    if (days && (days.includes(new Date(j.group_attendence_day).getDay() + ""))) {
                        obj.action.push(group)
                    }
                }
                results.push(obj)
            }
            return results
        }
    },
    Calendar: {
        date: (global: any) => global.date,
        groups: (global: any) => global.action
    }
}

export default resolvers;