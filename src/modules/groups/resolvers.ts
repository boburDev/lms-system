import { AddGroupInput, Group } from '../../types/groups';
import AppDataSource from "../../config/ormconfig";
import GroupEntity, { Group_attendences } from "../../entities/groups.entity";

const resolvers = {
  Query: {
    groups: async(): Promise<GroupEntity[]> => {
      const countryRepository = AppDataSource.getRepository(GroupEntity)
      return await countryRepository.find()
    }
  },
  Mutation: {
    addGroup: async (_parent: unknown, { input }: { input: AddGroupInput }, context: any) => {
      
      let verifyGroup = await checkGroup(input.employerId, input.roomId, context.branchId, input.groupDays.join(' '), input.startTime, input.endTime)
      
      if (verifyGroup) throw new Error(`Xona yoki o'qituvchi band bu vaqtlarda teacher: ${input.employerId == verifyGroup.group_colleague_id}, room: ${input.roomId == verifyGroup.group_room_id}`);
      
      let group = new GroupEntity()
      group.group_name = input.groupName
      group.group_course_id = input.courseId
      group.group_branch_id = context.branchId
      group.group_colleague_id = input.employerId
      group.group_room_id = input.roomId
      group.group_start_date = new Date(input.startDate)
      group.group_end_date = new Date(input.endDate)
      group.group_start_time = input.startTime
      group.group_end_time = input.endTime
      group.group_days = input.groupDays.join(' ')
      group.group_lesson_count = input.lessonCount
      
      // console.log(group)
      const groupRepository = await AppDataSource.getRepository(GroupEntity).save(group);
      
      const days = getDays(groupRepository.group_start_date, groupRepository.group_end_date)
      const groupAttendenceRepository = AppDataSource.getRepository(Group_attendences)
      
      for (const i of days) {
        let groupAttendence = new Group_attendences()
        groupAttendence.group_attendence_group_id = groupRepository.group_id
        groupAttendence.group_attendence_day = i
        await groupAttendenceRepository.save(groupAttendence);
      }

      return groupRepository
    },
  },
  Group: {
    groupId: (global: Group) => global.group_id,
    groupName: (global: Group) => global.group_name,
    courseId: (global: Group) => global.group_course_id,
    courseName: (global: Group) => global.group_course_name,
    employerId: (global: Group) => global.group_colleague_id,
    employerName: (global: Group) => global.group_colleague_name,
    roomId: (global: Group) => global.group_room_id,
    roomName: (global: Group) => global.group_room_name,
    startDate: (global: Group) => global.group_start_date,
    endDate: (global: Group) => global.group_end_date,
    startTime: (global: Group) => global.group_start_time,
    endTime: (global: Group) => global.group_end_time,
	}
};

export default resolvers;

async function checkGroup(employerId: string, roomId: string, branchId: string, groupDays: string, startTime: string, endTime: string) {
  const query = `select eg.* from groups as eg
  where(eg.group_colleague_id = $1 or eg.group_room_id = $2)
  and(select check_group(eg.group_days,
      $4, eg.group_start_time, group_end_time, $5, $6)) = true and eg.group_branch_id = $3
  `;
  const result = await AppDataSource.query(query, [
    employerId,
    roomId,
    branchId,
    groupDays,
    startTime,
    endTime,
  ]);

  return result[0];
}

function getDays(startDate: Date, endDate: Date): Date[] {
  let dates: Date[] = [];
  let theDate: Date = new Date(startDate.getTime());

  while (theDate.getTime() <= endDate.getTime()) {
    dates = [...dates, new Date(theDate)];
    theDate.setDate(theDate.getDate() + 1);
  }

  return dates;
}