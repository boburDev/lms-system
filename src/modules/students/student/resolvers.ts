import StudentEntity from "../../../entities/student/students.entity";
import AppDataSource from "../../../config/ormconfig";
import { AddStudentInput, Student } from "../../../types/students";
import Groups from "../../../entities/group/groups.entity";
import Student_groups, { Student_attendences } from "../../../entities/student/student_groups.entity";
import { getDays } from "../../../utils/date";

const resolvers = {
  Query: {
    students: async (_parametr: unknown, { }, context: any): Promise<StudentEntity[]> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const studentRepository = AppDataSource.getRepository(StudentEntity)
      return await studentRepository.find({ where: { student_branch_id: context.branchId } })
    },
    studentById: async (_parametr: unknown, Id: any, context: any) => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const studentRepository = AppDataSource.getRepository(StudentEntity)
      return await studentRepository.findOneBy({ student_id: Id.Id })
    }
  },
  Mutation: {
    addStudent: async (_parent: unknown, { input }: { input: AddStudentInput }, context: any): Promise<StudentEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const studentRepository = AppDataSource.getRepository(StudentEntity)

      let data = await studentRepository.findOneBy({ student_phone: input.studentPhone, student_branch_id: context.branchId })
      if (data !== null) throw new Error(`Bu uquv markazida "${input.studentPhone}" raqamli uquvchi mavjud`)

      let student = new StudentEntity()
      student.student_name = input.studentName
      student.student_phone = input.studentPhone
      student.student_password = input.studentPassword
      student.student_status = 1
      student.student_birthday = new Date(input.studentBithday)
      student.student_gender = input.studentGender
      student.student_balance = input.studentBalance || 0
      student.colleague_id = input.colleagueId || context.colleagueId
      student.student_branch_id = context.branchId
      student.parentsInfo = input.parentsInfo

      let studentData = await studentRepository.save(student)
      if (input.groupId && input.addedDate) {
          const GroupRepository = AppDataSource.getRepository(Groups)
          let dataGroup = await GroupRepository.findOneBy({ group_id: input.groupId })
          if (!dataGroup) throw new Error("Gruppa mavjud emas");
          if (
            new Date(dataGroup.group_start_date) > new Date(input.addedDate) ||
            new Date(dataGroup.group_end_date) < new Date(input.addedDate)
          ) throw new Error("Gruppani tugash vaqti qushilish vaqtidan kichkina!")

        const studentGroupRepository = AppDataSource.getRepository(Student_groups)
        let data = await studentGroupRepository.findOneBy({ student_id: studentData.student_id, group_id: input.groupId })
        if (data !== null) throw new Error(`Bu gruppada uquvchi uqimoqda`)
          
        let studentGroup = new Student_groups()
        studentGroup.student_group_add_time = new Date(input.addedDate)
        studentGroup.student_id = studentData.student_id
        studentGroup.group_id = input.groupId
        await studentGroupRepository.save(studentGroup)

        const days = getDays(new Date(input.addedDate), dataGroup.group_end_date)
        const groupAttendenceRepository = AppDataSource.getRepository(Student_attendences)

        for (const i of days) {
          let studentAttendence = new Student_attendences()
          studentAttendence.student_attendence_group_id = dataGroup.group_id
          studentAttendence.student_attendence_student_id = studentData.student_id
          studentAttendence.student_attendence_day = i
          await groupAttendenceRepository.save(studentAttendence);
        }
      }
      
      return studentData
    }
  },
  Student: {
    studentId: (global: Student) => global.student_id,
    studentName: (global: Student) => global.student_name,
    studentPhone: (global: Student) => global.student_phone,
    studentStatus: (global: Student) => global.student_status,
    studentBalance: (global: Student) => global.student_balance,
    studentBithday: (global: Student) => global.student_birthday,
    studentGender: (global: Student) => global.student_gender,
    colleagueId: (global: Student) => global.colleague_id
  }
};

export default resolvers;