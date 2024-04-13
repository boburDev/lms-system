import StudentEntity from "../../entities/students.entity";
import AppDataSource from "../../config/ormconfig";
import { AddStudentInput, Student } from "../../types/students";

const resolvers = {
  Query: {
    students: async (_parametr: unknown, { }, context: any): Promise<StudentEntity[]> => {
      const studentRepository = AppDataSource.getRepository(StudentEntity)
      return await studentRepository.find({ where: { student_branch_id: context.branchId } })
    }
  },
  Mutation: {
    addStudent: async (_parent: unknown, { input }: { input: AddStudentInput }, context: any): Promise<StudentEntity> => {
      const studentRepository = AppDataSource.getRepository(StudentEntity)

      let data = await studentRepository.findOneBy({ student_phone: input.studentPhone, student_branch_id: context.branchId })
      if (data !== null) throw new Error(`Bu uquv markazida "${input.studentPhone}" raqamli uquvchi mavjud`)

      let student = new StudentEntity()
      student.student_name = input.studentName
      student.student_phone = input.studentPhone
      student.student_password = input.studentPassword
      student.student_status = 1
      student.student_balance = input.studentBalance || 0
      student.colleague_id = input.colleagueId
      student.student_branch_id = context.branchId

      return await studentRepository.save(student)
    }
  },
  Student: {
    studentId: (global: Student) => global.student_id,
    studentName: (global: Student) => global.student_name,
    studentPhone: (global: Student) => global.student_phone,
    studentStatus: (global: Student) => global.student_status,
    studentBalance: (global: Student) => global.student_balance,
    colleagueId: (global: Student) => global.colleague_id
  }
};

export default resolvers;