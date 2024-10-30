import CourseEntity from "../../entities/course.entity";
import AppDataSource from "../../config/ormconfig";
import { AddCourseInput, Course, UpdateCourseInput } from "../../types/course";

const resolvers = {
  Query: {
    courses: async (_parametr: unknown, {}, context: any): Promise<CourseEntity[]> => {
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

      try {
        let data = await courseRepository.createQueryBuilder("course")
          .where("course.course_name = :name", { name: input.courseName })
          .andWhere("course.course_branch_id = :id", { id: context.branchId })
          .andWhere("course.course_deleted IS NULL")
          .getOne();

        if (data !== null) throw new Error(`Bu uquv markazida "${input.courseName}" nomli course mavjud`);

        let course = new CourseEntity();
        course.course_name = input.courseName;
        course.course_price = input.coursePrice;
        course.course_duration = input.courseDuration;
        course.course_duration_lesson = input.courseDurationLesson;
        course.course_branch_id = context.branchId;

        return await courseRepository.save(course);
      } catch (error) {
        await catchErrors(error, 'addCourse', context.branchId, input);
        throw error;
      }
    },

    updateCourse: async (_parent: unknown, { input }: { input: UpdateCourseInput }, context: any): Promise<CourseEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors;
      const courseRepository = AppDataSource.getRepository(CourseEntity);

      try {
        let data = await courseRepository.createQueryBuilder("course")
          .where("course.course_id = :Id", { Id: input.courseId })
          .andWhere("course.course_branch_id = :id", { id: context.branchId })
          .andWhere("course.course_deleted IS NULL")
          .getOne();

        if (!data) throw new Error(`Course not found`);

        data.course_name = input.courseName || data.course_name;
        data.course_price = input.coursePrice || data.course_price;
        data.course_duration = input.courseDuration || data.course_duration;
        data.course_duration_lesson = input.courseDurationLesson || data.course_duration_lesson;

        return await courseRepository.save(data);
      } catch (error) {
        await catchErrors(error, 'updateCourse', context.branchId, input);
        throw error;
      }
    },

    deleteCourse: async (_parent: unknown, { courseId }: { courseId: string }, context: any): Promise<CourseEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors;
      const courseRepository = AppDataSource.getRepository(CourseEntity);

      try {
        let data = await courseRepository.createQueryBuilder("course")
          .where("course.course_id = :id", { id: courseId })
          .andWhere("course.course_deleted IS NULL")
          .getOne();

        if (data === null) throw new Error(`Bu kurs mavjud emas`);

        data.course_deleted = new Date();
        await courseRepository.save(data);
        return data;
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
