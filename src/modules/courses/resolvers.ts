import CourseEntity from "../../entities/course.entity";
import AppDataSource from "../../config/ormconfig";
import { AddCourseInput, Course } from "../../types/courses";

const resolvers = {
  Query: {
    courses: async (_parametr: unknown, {}, context:any): Promise<CourseEntity[]> => {
      const courseRepository = AppDataSource.getRepository(CourseEntity)
      return await courseRepository.find({ where: { course_branch_id: context.branchId } })
    },
  },
  Mutation: {
    addCourse: async (_parent: unknown, { input }: { input: AddCourseInput }, context:any): Promise<CourseEntity> => {
      const courseRepository = AppDataSource.getRepository(CourseEntity)
      
      let data = await courseRepository.findOneBy({ course_name: input.courseName, course_branch_id: context.branchId })
      if (data !== null) throw new Error(`Bu uquv markazida "${input.courseName}" nomli course mavjud`)

      let course = new CourseEntity()
      course.course_name = input.courseName
      course.course_price = input.coursePrice
      course.course_duration = input.courseDuration
      course.course_duration_lesson = input.courseDurationLesson
      course.course_branch_id = context.branchId

      return await courseRepository.save(course)
    }
  },
  Course:{
    courseId: (global: Course) => global.course_id,
    courseName: (global: Course) => global.course_name,
    coursePrice: (global: Course) => global.course_price,
    courseDuration: (global: Course) => global.course_duration,
    courseDurationLesson: (global: Course) => global.course_duration_lesson,
  }
};

export default resolvers;