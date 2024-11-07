import CourseEntity from "../../entities/course.entity";
import AppDataSource from "../../config/ormconfig";
import { AddCourseInput, Course, UpdateCourseInput } from "../../types/course";
import { getChanges } from "../../utils/eventRecorder";

const resolvers = {
  Query: {
    courses: async (_parametr: unknown, { }, context: any): Promise<CourseEntity[]> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors;
      const courseRepository = AppDataSource.getRepository(CourseEntity);

      try {
        return await courseRepository.createQueryBuilder("course")
          .where("course.course_branch_id = :branchId", { branchId: context.branchId })
          .andWhere("course.course_deleted IS NULL")
          .orderBy("course.course_created_at", "DESC")
          .getMany();
      } catch (error) {
        await catchErrors(error, 'courses');
        throw error;
      }
    },

    coursById: async (_parametr: unknown, { Id }: { Id: string }, context: any): Promise<CourseEntity | null> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors;
      const courseRepository = AppDataSource.getRepository(CourseEntity);

      try {
        return await courseRepository.createQueryBuilder("course")
          .where("course.course_branch_id = :branchId", { branchId: context.branchId })
          .andWhere("course.course_id = :Id", { Id })
          .andWhere("course.course_deleted IS NULL")
          .getOne();
      } catch (error) {
        await catchErrors(error, 'coursById');
        throw error;
      }
    },

    courseGroups: async (_parametr: unknown, { courseId }: { courseId: string }, context: any) => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors;
      const courseRepository = AppDataSource.getRepository(CourseEntity);

      try {
        let data = await courseRepository.createQueryBuilder("course")
          .leftJoinAndSelect("course.group", "group")
          .leftJoinAndSelect("group.employer", "employer")
          .where("course.course_branch_id = :branchId", { branchId: context.branchId })
          .andWhere("course.course_id = :courseId", { courseId })
          .andWhere("course.course_deleted IS NULL")
          .andWhere("group.group_deleted IS NULL")
          .orderBy("course.course_created_at", "DESC")
          .getOne();

        return data?.group;
      } catch (error) {
        await catchErrors(error, 'courseGroups');
        throw error;
      }
    }
  },

  Mutation: {
    addCourse: async (_parent: unknown, { input }: { input: AddCourseInput }, context: any): Promise<CourseEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors;
      const courseRepository = AppDataSource.getRepository(CourseEntity);
      const writeActions = context.writeActions;

      try {
        let existingCourse = await courseRepository.createQueryBuilder("course")
          .where("course.course_name = :name", { name: input.courseName })
          .andWhere("course.course_branch_id = :id", { id: context.branchId })
          .andWhere("course.course_deleted IS NULL")
          .getOne();

        if (existingCourse !== null) throw new Error(`Bu uquv markazida "${input.courseName}" nomli course mavjud`);

        let course = new CourseEntity();
        course.course_name = input.courseName;
        course.course_price = input.coursePrice;
        course.course_duration = input.courseDuration;
        course.course_duration_lesson = input.courseDurationLesson;
        course.course_branch_id = context.branchId;

        let newCourse = await courseRepository.save(course);

        // Log each field of the newly created course
        const courseChanges = getChanges({}, newCourse, [
          "course_name",
          "course_price",
          "course_duration",
          "course_duration_lesson",
          "course_branch_id"
        ]);

        for (const change of courseChanges) {
          await writeActions({
            objectId: newCourse.course_id,
            eventType: 1,
            eventBefore: change.before,
            eventAfter: change.after,
            eventObject: "Course",
            eventObjectName: change.field,
            employerId: context.colleagueId || "",
            employerName: context.colleagueName || "",
            branchId: context.branchId || "",
          });
        }

        return newCourse;
      } catch (error) {
        await catchErrors(error, 'addCourse', context.branchId, input);
        throw error;
      }
    }
    ,

    updateCourse: async (_parent: unknown, { input }: { input: UpdateCourseInput }, context: any): Promise<CourseEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors;
      const courseRepository = AppDataSource.getRepository(CourseEntity);
      const writeActions = context.writeActions;

      try {
        let course = await courseRepository.createQueryBuilder("course")
          .where("course.course_id = :Id", { Id: input.courseId })
          .andWhere("course.course_branch_id = :id", { id: context.branchId })
          .andWhere("course.course_deleted IS NULL")
          .getOne();

        if (!course) throw new Error(`Course not found`);

        const originalCourse = { ...course };

        // Apply updates
        course.course_name = input.courseName || course.course_name;
        course.course_price = input.coursePrice || course.course_price;
        course.course_duration = input.courseDuration || course.course_duration;
        course.course_duration_lesson = input.courseDurationLesson || course.course_duration_lesson;

        let updatedCourse = await courseRepository.save(course);

        // Log each change in the updated course entity
        const courseChanges = getChanges(originalCourse, updatedCourse, [
          "course_name",
          "course_price",
          "course_duration",
          "course_duration_lesson"
        ]);

        for (const change of courseChanges) {
          await writeActions({
            objectId: updatedCourse.course_id,
            eventType: 2,
            eventBefore: change.before,
            eventAfter: change.after,
            eventObject: "Course",
            eventObjectName: change.field,
            employerId: context.colleagueId || "",
            employerName: context.colleagueName || "",
            branchId: context.branchId || ""
          });
        }

        return updatedCourse;
      } catch (error) {
        await catchErrors(error, 'updateCourse', context.branchId, input);
        throw error;
      }
    }
    ,

    deleteCourse: async (_parent: unknown, { courseId }: { courseId: string }, context: any): Promise<CourseEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors;
      const courseRepository = AppDataSource.getRepository(CourseEntity);
      const writeActions = context.writeActions;

      try {
        let course = await courseRepository.createQueryBuilder("course")
          .where("course.course_id = :id", { id: courseId })
          .andWhere("course.course_branch_id = :branchId", { branchId: context.branchId })
          .andWhere("course.course_deleted IS NULL")
          .getOne();

        if (!course) throw new Error(`Bu kurs mavjud emas`);

        course.course_deleted = new Date();
        await courseRepository.save(course);

        // Log deletion action
        await writeActions({
          objectId: course.course_id,
          eventType: 3,
          eventBefore: JSON.stringify(course),
          eventAfter: "",
          eventObject: "Course",
          eventObjectName: "deleteCourse",
          employerId: context.colleagueId || "",
          employerName: context.colleagueName || "",
          branchId: context.branchId || ""
        });

        return course;
      } catch (error) {
        await catchErrors(error, 'deleteCourse', context.branchId, { courseId });
        throw error;
      }
    }

  },

  Course: {
    courseId: (global: Course) => global.course_id,
    courseName: (global: Course) => global.course_name,
    coursePrice: (global: Course) => global.course_price,
    courseDuration: (global: Course) => global.course_duration,
    courseDurationLesson: (global: Course) => global.course_duration_lesson,
  }
};

export default resolvers;
