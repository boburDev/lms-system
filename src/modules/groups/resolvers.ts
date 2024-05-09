import { AddGroupInput, Group } from '../../types/groups';
import AppDataSource from "../../config/ormconfig";
import GroupEntity from "../../entities/groups.entity";

const resolvers = {
  Query: {
    groups: async(): Promise<GroupEntity[]> => {
      const countryRepository = AppDataSource.getRepository(GroupEntity)
      return await countryRepository.find()
    }
  },
  Mutation: {
    addGroup: async (_parent: unknown, { input }: { input: AddGroupInput }, context: any): Promise<GroupEntity> => {
      let group = new GroupEntity()
      group.group_name = input.groupName
      group.group_course_id = input.courseId
      group.group_branch_id = context.branchId
      group.group_colleague_id = input.employerId
      group.group_room_id = input.roomId
      group.group_start_date = input.startDate
      group.group_end_date = input.endDate
      group.group_start_time = input.startTime
      group.group_end_time = input.endTime
      group.group_days = input.groupDays
      group.group_lesson_count = input.lessonCount
      console.log(group, input)
      
      const groupRepository = AppDataSource.getRepository(GroupEntity)
      
      return await groupRepository.save(group)
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