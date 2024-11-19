import { AddGroupInput, Group, UpdateGroupInput } from '../../../types/group';
import AppDataSource from "../../../config/ormconfig";
import GroupEntity, { GroupAttendences } from "../../../entities/group/groups.entity";
import { getDays } from '../../../utils/date';
import StudentGroups, { StudentAttendences } from '../../../entities/student/student_groups.entity';
import { getChanges } from '../../../utils/eventRecorder';
import { pubsub } from '../../../utils/pubSub';

const resolvers = {
  Query: {
    groups: async (_parametr: unknown, { page, count, isArchive }: { page: number, count: number, isArchive: boolean }, context: any): Promise<GroupEntity[]> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors
      const branchId = context.branchId

      try {
        const groupRepository = AppDataSource.getRepository(GroupEntity)

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // console.log(1, today.toISOString().split('T')[0])
        const endDateCondition = isArchive ? "<" : ">";

        let data = await groupRepository.createQueryBuilder("group")
          .leftJoinAndSelect("group.employer", "employer")
          .leftJoinAndSelect("group.room", "room")
          .leftJoinAndSelect("group.course", "course")
          .leftJoinAndSelect("group.student_group", "student_group")
          .where("group.group_branch_id = :branchId", { branchId: context.branchId })
          .andWhere(`group.group_end_date ${endDateCondition} :endDate`, { endDate: today.toISOString().split('T')[0] })
          .andWhere("group.group_deleted IS NULL")
          .skip((page - 1) * count)
          .take(count)
          .orderBy("group.group_created", "DESC")
          .getMany();
        return data
      } catch (error) {
        await catchErrors(error, 'groups', branchId)
        throw error;
      }


    },
    groupCount: async (_parametr: unknown, { isArchive }: { isArchive: boolean }, context: any) => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors
      const branchId = context.branchId
      try {
        const groupRepository = AppDataSource.getRepository(GroupEntity)

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDateCondition = isArchive ? "<" : ">";

        return await groupRepository.createQueryBuilder("groups")
          .where("groups.group_deleted IS NULL")
          .andWhere("groups.group_branch_id = :branchId", { branchId })
          .andWhere(`groups.group_end_date ${endDateCondition} :endDate`, { endDate: today.toISOString().split('T')[0] })
          .andWhere("groups.group_deleted IS NULL")
          .getCount();
      } catch (error) {
        await catchErrors(error, 'groupCount', branchId)
        throw error;
      }
    },
    groupByIdOrDate: async (_parametr: unknown, input: AddGroupInput, context: any) => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors
      const branchId = context.branchId

      try {
        let groupRepository = AppDataSource.getRepository(GroupEntity)
        let data

        if (input.startDate && input.endDate) {
          return null
        } else if (input.Id) {
          data = await groupRepository.createQueryBuilder("group")
            .leftJoinAndSelect("group.employer", "employer")
            .leftJoinAndSelect("group.room", "room")
            .leftJoinAndSelect("group.course", "course")
            .leftJoinAndSelect("group.student_group", "student_group")
            .leftJoinAndSelect("student_group.student", "student")
            .where("group.group_branch_id = :branchId", { branchId: context.branchId })
            .andWhere("group.group_id = :groupId", { groupId: input.Id })
            .andWhere("group.group_deleted IS NULL")
            .andWhere("student.student_deleted IS NULL")
            .getOne();
        }

        return data
      } catch (error) {
        await catchErrors(error, 'groupByIdOrDate', branchId)
        throw error;
      }


    }
  },
  Mutation: {
    addGroup: async (_parent: unknown, { input }: { input: AddGroupInput }, context: any): Promise<GroupEntity | null> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors;
      const branchId = context.branchId;
      const writeActions = context.writeActions;

      try {
        let verifyGroup = await checkGroup(input.employerId, input.roomId, branchId, input.groupDays.join(' '), input.startTime, input.endTime);
        if (verifyGroup) throw new Error(`Xona yoki o'qituvchi band bu vaqtlarda teacher: ${input.employerId == verifyGroup.group_colleague_id}, room: ${input.roomId == verifyGroup.group_room_id}`);

        const group = new GroupEntity();
        group.group_name = input.groupName;
        group.group_course_id = input.courseId;
        group.group_branch_id = branchId;
        group.group_colleague_id = input.employerId;
        group.group_room_id = input.roomId;
        group.group_start_date = new Date(input.startDate);
        group.group_end_date = new Date(input.endDate);
        group.group_start_time = input.startTime;
        group.group_end_time = input.endTime;
        group.group_days = input.groupDays.join(' ');
        group.group_lesson_count = input.lessonCount;

        const groupRepository = await AppDataSource.getRepository(GroupEntity).save(group);

        const groupChanges = getChanges({}, groupRepository, [
          "group_name",
          "group_course_id",
          "group_branch_id",
          "group_colleague_id",
          "group_room_id",
          "group_start_date",
          "group_end_date",
          "group_start_time",
          "group_end_time",
          "group_days",
          "group_lesson_count"
        ]);

        for (const change of groupChanges) {
          await writeActions({
            objectId: groupRepository.group_id,
            eventType: 1,
            eventBefore: change.before,
            eventAfter: change.after,
            eventObject: "Group",
            eventObjectName: change.field,
            employerId: context.colleagueId || "",
            employerName: context.colleagueName || "",
            branchId: branchId
          });
        }

        const days = getDays(groupRepository.group_start_date, groupRepository.group_end_date);
        const groupAttendenceRepository = AppDataSource.getRepository(GroupAttendences);

        for (const day of days) {
          const groupAttendence = new GroupAttendences();
          groupAttendence.group_attendence_group_id = groupRepository.group_id;
          groupAttendence.group_attendence_day = day;
          await groupAttendenceRepository.save(groupAttendence);
        }

        pubsub.publish("GROUP_ADDED", { groupAdded: groupRepository });

        return groupRepository;
      } catch (error) {
        await catchErrors(error, 'addGroup', branchId, input);
        throw error;
      }
    },
    updateGroup: async (_parent: unknown, { input }: { input: UpdateGroupInput }, context: any): Promise<GroupEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors;
      const branchId = context.branchId;
      const writeActions = context.writeActions;

      try {
        const groupRepository = AppDataSource.getRepository(GroupEntity);
        let group = await groupRepository.createQueryBuilder("group")
          .where("group.group_id = :groupId", { groupId: input.groupId })
          .andWhere("group.group_deleted IS NULL")
          .getOne();

        if (!group) throw new Error("group not found");

        const originalGroup = { ...group };

        group.group_name = input.groupName || group.group_name;
        group.group_course_id = input.courseId || group.group_course_id;
        group.group_branch_id = branchId || group.group_branch_id;
        group.group_colleague_id = input.employerId || group.group_colleague_id;
        group.group_room_id = input.roomId || group.group_room_id;
        group.group_start_date = input.startDate ? new Date(input.startDate) : group.group_start_date;
        group.group_end_date = input.endDate ? new Date(input.endDate) : group.group_end_date;
        group.group_start_time = input.startTime || group.group_start_time;
        group.group_end_time = input.endTime || group.group_end_time;
        group.group_days = input.groupDays ? input.groupDays.join(' ') : group.group_days;
        group.group_lesson_count = input.lessonCount || group.group_lesson_count;

        const updatedGroup = await groupRepository.save(group);

        const groupChanges = getChanges(originalGroup, updatedGroup, [
          "group_name",
          "group_course_id",
          "group_branch_id",
          "group_colleague_id",
          "group_room_id",
          "group_start_date",
          "group_end_date",
          "group_start_time",
          "group_end_time",
          "group_days",
          "group_lesson_count"
        ]);

        for (const change of groupChanges) {
          await writeActions({
            objectId: updatedGroup.group_id,
            eventType: 2,
            eventBefore: change.before,
            eventAfter: change.after,
            eventObject: "Group",
            eventObjectName: change.field,
            employerId: context.colleagueId || "",
            employerName: context.colleagueName || "",
            branchId: branchId
          });
        }

        pubsub.publish("GROUP_UPDATED", { groupUpdated: updatedGroup });

        return updatedGroup;
      } catch (error) {
        await catchErrors(error, 'updateGroup', branchId, input);
        throw error;
      }
    },
    deleteGroup: async (_parent: unknown, { Id }: { Id: string }, context: any) => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const branchId = context.branchId;
      const catchErrors = context.catchErrors;
      const writeActions = context.writeActions;

      try {
        const groupRepository = AppDataSource.getRepository(GroupEntity);
        let group = await groupRepository.createQueryBuilder("group")
          .where("group.group_id = :id", { id: Id })
          .andWhere("group.group_deleted IS NULL")
          .getOne();

        if (!group) throw new Error(`Guruh mavjud emas`);

        group.group_deleted = new Date();
        const deletedGroup = await groupRepository.save(group);

        await writeActions({
          objectId: deletedGroup.group_id,
          eventType: 3,
          eventBefore: JSON.stringify(group),
          eventAfter: "",
          eventObject: "Group",
          eventObjectName: "deleteGroup",
          employerId: context.colleagueId || "",
          employerName: context.colleagueName || "",
          branchId: branchId
        });

        pubsub.publish("GROUP_DELETED", { groupDeleted: deletedGroup });

        return deletedGroup;
      } catch (error) {
        await catchErrors(error, 'deleteGroup', branchId);
        throw error;
      }
    }
  },
  Subscription: {
    groupAdded: {
      subscribe: () => pubsub.asyncIterator("GROUP_ADDED")
    },
    groupUpdated: {
      subscribe: () => pubsub.asyncIterator("GROUP_UPDATED")
    },
    groupDeleted: {
      subscribe: () => pubsub.asyncIterator("GROUP_DELETED")
    }
  },
  Group: {
    groupId: (global: Group) => global?.group_id,
    groupName: (global: Group) => global?.group_name,
    courseId: (global: Group) => global?.group_course_id,
    courseName: (global: Group) => global?.course?.course_name,
    employerId: (global: Group) => global?.group_colleague_id,
    employerName: (global: Group) => global?.employer?.employer_name,
    roomId: (global: Group) => global?.group_room_id,
    roomName: (global: Group) => global?.room?.room_name,
    startDate: (global: Group) => global?.group_start_date,
    endDate: (global: Group) => global?.group_end_date,
    startTime: (global: Group) => global?.group_start_time,
    endTime: (global: Group) => global?.group_end_time,
    groupDays: (global: Group) => global?.group_days.split(' '),
    studentCount: (global: Group) => Array.isArray(global?.student_group) ? global?.student_group.length : 0,
  },
  GroupById: {
    groupId: (global: Group) => global?.group_id,
    groupName: (global: Group) => global?.group_name,
    courseId: (global: Group) => global?.group_course_id,
    courseName: (global: Group) => global?.course?.course_name,
    employerId: (global: Group) => global?.group_colleague_id,
    employerName: (global: Group) => global?.employer?.employer_name,
    roomId: (global: Group) => global?.group_room_id,
    roomName: (global: Group) => global?.room?.room_name,
    startDate: (global: Group) => global?.group_start_date,
    endDate: (global: Group) => global?.group_end_date,
    startTime: (global: Group) => global?.group_start_time,
    endTime: (global: Group) => global?.group_end_time,
    groupDays: (global: Group) => global?.group_days.split(' '),
    students: (global: Group) => {
      return global?.student_group && global?.student_group.map(i => {
        return {
          studentId: i.student_id,
          studentName: i.student.student_name,
          studentStatus: i.student_group_status,
          studentBalance: i.student_group_credit,
          studentAddDate: i.student_group_add_time
        }
      })
    }
  }
};

async function checkGroup(
  employerId: string,
  roomId: string,
  branchId: string,
  groupDays: string,
  startTime: string,
  endTime: string
) {
  const query = `
    SELECT eg.* 
    FROM groups AS eg
    WHERE (eg.group_colleague_id = $1 OR eg.group_room_id = $2)
      AND eg.group_branch_id = $3
      AND eg.group_deleted IS NULL
      AND check_group(eg.group_days, $4, eg.group_start_time, eg.group_end_time, $5, $6) = true
  `;

  const result = await AppDataSource.query(query, [
    employerId,
    roomId,
    branchId,
    groupDays,
    startTime,
    endTime
  ]);
  return result[0];
}

export default resolvers;
