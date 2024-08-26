import StudentEntity from "../../../entities/student/students.entity";
import AppDataSource from "../../../config/ormconfig";
import { AddStudentInput, Student, UpdateStudentInput } from "../../../types/student";
import Groups from "../../../entities/group/groups.entity";
import StudentGroups, { StudentAttendences } from "../../../entities/student/student_groups.entity";
import { getDays } from "../../../utils/date";
// import StudentPayments from "../../../entities/student/student_payments.entity";
// import StudentCashes from "../../../entities/student/student_cashes.entity";

const resolvers = {
  Query: {
    students: async (_parametr: unknown, { page, count }: { page: number, count: number }, context: any): Promise<StudentEntity[]> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const studentRepository = AppDataSource.getRepository(StudentEntity)

      let data = await studentRepository.createQueryBuilder("students")
        .leftJoinAndSelect("students.student_group", "student_group")
        .leftJoinAndSelect("student_group.group", "group")
        .leftJoinAndSelect("group.employer", "employer")
        .where("students.student_branch_id = :branchId", { branchId: context.branchId })
        .andWhere("students.student_deleted IS NULL")
        .take(count)
        .skip((page - 1) * count)
        .orderBy("students.student_created", "DESC")
        .getMany();

      return data
    },
    studentCount: async (_parametr: unknown, { }, context: any): Promise<number> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const studentRepository = AppDataSource.getRepository(StudentEntity)
      return await studentRepository.createQueryBuilder("students")
        .where("students.student_deleted IS NULL")
        .andWhere("students.student_branch_id = :branchId", { branchId: context.branchId })
        .getCount();
    },
    studentById: async (_parametr: unknown, { Id }: { Id: string }, context: any): Promise<StudentEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const studentRepository = AppDataSource.getRepository(StudentEntity)
      let data = await studentRepository.createQueryBuilder("student")
        .leftJoinAndSelect("student.student_group", "student_group")
        .leftJoinAndSelect("student_group.group", "group")
        .leftJoinAndSelect("group.employer", "employer")
        .where("student.student_id = :Id", { Id })
        .getOne()

      if (!data) throw new Error("Student not found");
      return data
    }
  },
  Mutation: {
    addStudent: async (_parent: unknown, { input }: { input: AddStudentInput }, context: any): Promise<StudentEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const studentRepository = AppDataSource.getRepository(StudentEntity)

      let data = await studentRepository.createQueryBuilder("students")
        .where("students.student_branch_id = :branchId", { branchId: context.branchId })
        .andWhere("students.student_phone = :phone", { phone: input.studentPhone })
        .andWhere("students.student_deleted IS NULL")
        .getOne()

      if (data) throw new Error(`Bu uquv markazida "${input.studentPhone}" raqamli uquvchi mavjud`)

      let student = new StudentEntity()
      student.student_name = input.studentName
      student.student_phone = input.studentPhone
      student.student_status = 1
      if (input.studentBithday) {
        student.student_birthday = new Date(input.studentBithday)
      }
      student.student_gender = input.studentGender
      student.colleague_id = context.colleagueId
      student.student_branch_id = context.branchId
      student.parentsInfo = input.parentsInfo

      let studentData:any = await studentRepository.save(student)
      
      if (input.groupId && input.addedDate) {
        const GroupRepository = AppDataSource.getRepository(Groups)
        let dataGroup = await GroupRepository.createQueryBuilder("group")
          .leftJoinAndSelect("group.employer", "employer")
          .where("group.group_branch_id = :branchId", { branchId: context.branchId })
          .andWhere("group.group_id = :groupId", { groupId: input.groupId })
          .andWhere("group.group_deleted IS NULL")
          .getOne();
        if (!dataGroup) throw new Error("Gruppa mavjud emas");
           
        const addedDate: Date = new Date(input.addedDate);
        const groupStartDate: Date = new Date(dataGroup.group_start_date);
        const groupEndDate: Date = new Date(dataGroup.group_end_date);
        
        if (!((groupStartDate <= addedDate) && (addedDate <= groupEndDate))) throw new Error("Guruhning tugash voqti utib ketgandan ken qushomisiz!")

        const studentGroupRepository = AppDataSource.getRepository(StudentGroups)
        let data = await studentGroupRepository.findOneBy({ student_id: studentData.student_id, group_id: input.groupId })
        if (data !== null) throw new Error(`Bu gruppada uquvchi uqimoqda`)

        let studentGroup = new StudentGroups()
        studentGroup.student_group_add_time = new Date(input.addedDate)
        studentGroup.student_group_lesson_end = dataGroup.group_end_date
        studentGroup.student_id = studentData.student_id
        studentGroup.group_id = input.groupId
        studentGroup.student_group_status = 4
        await studentGroupRepository.save(studentGroup)

        const days = getDays(new Date(input.addedDate), dataGroup.group_end_date)
        const groupAttendenceRepository = AppDataSource.getRepository(StudentAttendences)

        for (const i of days) {
          let studentAttendence = new StudentAttendences()
          studentAttendence.student_attendence_group_id = dataGroup.group_id
          studentAttendence.student_attendence_student_id = studentData.student_id
          studentAttendence.student_attendence_day = i
          await groupAttendenceRepository.save(studentAttendence);
        }
        studentData.student_group = [{ group: dataGroup }]
      }
      
      return studentData
    },
    updateStudent: async (_parent: unknown, { input }: { input: UpdateStudentInput }, context: any): Promise<StudentEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const studentRepository = AppDataSource.getRepository(StudentEntity)

      let student = await studentRepository.createQueryBuilder("students")
        .where("students.student_branch_id = :branchId", { branchId: context.branchId })
        .andWhere("students.student_id = :Id", { Id: input.studentId })
        .andWhere("students.student_deleted IS NULL")
        .getOne()

      if (!student) throw new Error(`Bu uquv markazida bu uquvchi mavjud`)
      student.student_name = input.studentName || student.student_name
      student.student_phone = input.studentPhone || student.student_phone
      student.student_birthday = new Date(input.studentBithday) || student.student_birthday
      student.student_gender = input.studentGender || student.student_gender
      student.parentsInfo = input.parentsInfo || student.parentsInfo
      return await studentRepository.save(student)
    },
    deleteStudent: async (_parent: unknown, { studentId }: { studentId: string }, context: any) => {
      try {
        if (!context?.branchId) throw new Error("Not exist access token!");
        const studentRepository = AppDataSource.getRepository(StudentEntity)

        let data = await studentRepository.findOneBy({ student_id: studentId })

        if (data === null) throw new Error(`Siz tanlagan uquvchi mavjud`)
        data.student_deleted = new Date()
        await studentRepository.save(data);
        return data
      } catch (error) {
        throw error;
      }
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
    colleagueId: (global: Student) => global.colleague_id,
    studentGroup: (global: Student) => {
      let results = []
      
      if (global.student_group && global.student_group.length) {
        for (const i of global.student_group) {
          results.push({
            groupId: i.group.group_id,
            groupName: i.group.group_name,
            colleagueName: i.group.employer.employer_name,
            lessonStartTime: i.group.group_start_time,
          })
        }
      }
      return results
    }
  }
};

export default resolvers;