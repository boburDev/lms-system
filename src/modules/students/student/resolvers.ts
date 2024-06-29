import StudentEntity from "../../../entities/student/students.entity";
import AppDataSource from "../../../config/ormconfig";
import { AddStudentInput, Student } from "../../../types/student";
import Groups from "../../../entities/group/groups.entity";
import Student_groups, { Student_attendences } from "../../../entities/student/student_groups.entity";
import { getDays } from "../../../utils/date";
import Student_payments from "../../../entities/student/student_payments.entity";
import Student_cashes from "../../../entities/student/student_cashes.entity";

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
      let data = await studentRepository.findOneBy({ student_id: Id })
      if (!data) throw new Error("Student not found");
      return data
    },
    studentGroups: async (_parametr: unknown, { studentId }: { studentId: string }, context: any) => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const studentRepository = AppDataSource.getRepository(StudentEntity)

      let res = await studentRepository.createQueryBuilder("students")
        .leftJoinAndSelect("students.student_group", "student_group")
        .leftJoinAndSelect("student_group.group", "group")
        .leftJoinAndSelect("group.employer", "employer")
        .leftJoinAndSelect("group.room", "room")
        .where("students.student_branch_id = :branchId", { branchId: context.branchId })
        .where("students.student_id = :studentId", { studentId: studentId })
        .andWhere("students.student_deleted IS NULL")
        .andWhere("group.group_deleted IS NULL")
        .getOne();
      let data = res?.student_group.map(i => {
        return {
          group_id: i.group.group_id,
          group_name: i.group.group_name,
          group_days: i.group.group_days,
          group_colleague_id: i.group.group_colleague_id,
          group_room_id: i.group.group_room_id,
          employer: { employer_name: i.group.employer.employer_name },
          room: { room_name: i.group.room.room_name }
        }
      })
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

      if (data !== null) throw new Error(`Bu uquv markazida "${input.studentPhone}" raqamli uquvchi mavjud`)

      let student = new StudentEntity()
      student.student_name = input.studentName
      student.student_phone = input.studentPhone
      student.student_password = input.studentPassword
      student.student_status = 1
      student.student_balance = input.studentCash || 0
      if (input.studentBithday) {
        student.student_birthday = new Date(input.studentBithday)
      }
      student.student_gender = input.studentGender
      student.colleague_id = input.colleagueId || context.colleagueId
      student.student_branch_id = context.branchId
      student.parentsInfo = input.parentsInfo

      let studentData:any = await studentRepository.save(student)
      
      if (input.groupId && input.addedDate) {
        const GroupRepository = AppDataSource.getRepository(Groups)
        let dataGroup = await GroupRepository.createQueryBuilder("group")
          .leftJoinAndSelect("group.employer", "employer")
          .where("group.group_branch_id = :branchId", { branchId: context.branchId })
          .andWhere("group.group_id = :groupId", { groupId: input.groupId })
          .getOne();
        if (!dataGroup) throw new Error("Gruppa mavjud emas");
           
        const addedDate: Date = new Date(input.addedDate);
        const groupStartDate: Date = new Date(dataGroup.group_start_date);
        const groupEndDate: Date = new Date(dataGroup.group_end_date);
        
        if (!((groupStartDate < addedDate) && (addedDate < groupEndDate))) throw new Error("Guruhning tugash voqti utib ketgandan ken qushomisiz!")

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
        studentData.student_group = [{ group: dataGroup }]
      }
      if (input.studentCash) {
        const studentCashCountRepository = AppDataSource.getRepository(Student_cashes)
        let studentCash = new Student_cashes()
        let count = await studentCashCountRepository.find({ where: { branch_id: context.branchId } })
        studentCash.cash_amount = input.studentCash
        studentCash.check_number = count.length + 1
        studentCash.student_cash_payed_at = new Date()
        studentCash.branch_id = context.branchId
        studentCash.student_id = studentData.student_id

        let studentCashData = await studentCashCountRepository.save(studentCash)

        const studentPaymentRepository = AppDataSource.getRepository(Student_payments)
        let studentPayment = new Student_payments()
        studentPayment.student_payment_debit = input.studentCash
        studentPayment.student_payment_type = input.studentCashType
        studentPayment.student_payment_payed_at = new Date()
        studentPayment.student_id = studentData.student_id
        studentPayment.employer_id = input.colleagueId || context.colleagueId
        studentPayment.student_cash_id = studentCashData.student_cash_id

        let studentPaymentData = await studentPaymentRepository.save(studentPayment)
      }
      return studentData
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
      console.log(global)
      
      if (global.student_group.length) {
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