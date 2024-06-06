import { AddGroupInput, Group } from '../../../types/groups';
import AppDataSource from "../../../config/ormconfig";
import GroupEntity, { Group_attendences } from "../../../entities/group/groups.entity";
import { getDays } from '../../../utils/date';

const resolvers = {
  Query: {
    groups: async (_parametr: unknown, { }, context: any): Promise<GroupEntity[]> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const groupRepository = AppDataSource.getRepository(GroupEntity)
      let data = await groupRepository.find({
        where: {
          group_branch_id: context.branchId
        },
        relations: ['employer', 'room', 'course', 'student_group']
      })
      return data
    },
    groupByIdOrDate: async (_parametr: unknown, input: AddGroupInput, context: any) => {
      if (!context?.branchId) throw new Error("Not exist access token!");

      let groupRepository = AppDataSource.getRepository(GroupEntity)
      let data

      if (input.startDate && input.endDate) {
      } else if (input.Id) {
        data = await groupRepository.createQueryBuilder("group")
          .leftJoinAndSelect("group.employer", "employer")
          .leftJoinAndSelect("group.room", "room")
          .leftJoinAndSelect("group.course", "course")
          .leftJoinAndSelect("group.student_group", "student_group")
          .leftJoinAndSelect("student_group.student", "student")
          .where("group.group_branch_id = :branchId", { branchId: context.branchId })
          .andWhere("group.group_id = :groupId", { groupId: input.Id })
          .getOne();
        // data = await groupRepository.findOne({ 
        //     where: {
        //       group_branch_id: context.branchId,
        //       group_id: input.Id
        //     },
        //   relations: ['employer', 'room', 'course', 'student_group']
        //  })
        //  if (data) {
        //    let days = data.group_days.split(" ") 
        //    let attendence = data.attendence
        //    let daysResult =attendence.filter(day => {
        //      if (days.includes(new Date(day.group_attendence_day).getDay() + '')) {
        //        return day
        //     }
        //    })
        //  }
      }
      
      return data
    }
  },
  Mutation: {
    addGroup: async (_parent: unknown, { input }: { input: AddGroupInput }, context: any): Promise< GroupEntity> => {
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
    courseName: (global: Group) => global.course.course_name,
    employerId: (global: Group) => global.group_colleague_id,
    employerName: (global: Group) => global.employer.employer_name,
    roomId: (global: Group) => global.group_room_id,
    roomName: (global: Group) => global.room.room_name,
    startDate: (global: Group) => global.group_start_date,
    endDate: (global: Group) => global.group_end_date,
    startTime: (global: Group) => global.group_start_time,
    endTime: (global: Group) => global.group_end_time,
    groupDays: (global: Group) => global.group_days.split(' '),
    studentCount: (global: Group) => Array.isArray(global.student_group) ? global.student_group.length : 0,
	},
  GroupById: {
    groupId: (global: Group) => global.group_id,
    groupName: (global: Group) => global.group_name,
    courseId: (global: Group) => global.group_course_id,
    courseName: (global: Group) => global.course.course_name,
    employerId: (global: Group) => global.group_colleague_id,
    employerName: (global: Group) => global.employer.employer_name,
    roomId: (global: Group) => global.group_room_id,
    roomName: (global: Group) => global.room.room_name,
    startDate: (global: Group) => global.group_start_date,
    endDate: (global: Group) => global.group_end_date,
    startTime: (global: Group) => global.group_start_time,
    endTime: (global: Group) => global.group_end_time,
    groupDays: (global: Group) => global.group_days.split(' '),
    students: (global: Group) => {
      return global.student_group && global.student_group.map(i => {
        return {
          studentId: i.student_group_id,
          studentName: i.student.student_name,
          studentStatus: i.student_group_status,
          studentBalance: i.student_group_credit,
          studentAddDate: i.student_group_add_time
        }
      })
    }
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