import StudentEntity from "../../../entities/student/students.entity";
import AppDataSource from "../../../config/ormconfig";
import { AddStudentInput, Student, UpdateStudentInput } from "../../../types/student";
import Groups from "../../../entities/group/groups.entity";
import StudentGroups, { StudentAttendences } from "../../../entities/student/student_groups.entity";
import { getDays } from "../../../utils/date";
import { getChanges } from "../../../utils/eventRecorder";
import { pubsub } from "../../../utils/pubSub";
// import StudentPayments from "../../../entities/student/student_payments.entity";
// import StudentCashes from "../../../entities/student/student_cashes.entity";

const resolvers = {
  Query: {
    students: async (_parametr: unknown, { page, count }: { page: number, count: number }, context: any): Promise<StudentEntity[]> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors;
      const branchId = context.branchId;

      try {
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
      } catch (error) {
        await catchErrors(error, 'students', branchId);
        throw error;
      }
    },
    studentCount: async (_parametr: unknown, { }, context: any): Promise<number> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors;
      const branchId = context.branchId

      try {
        const studentRepository = AppDataSource.getRepository(StudentEntity)
        return await studentRepository.createQueryBuilder("students")
          .where("students.student_deleted IS NULL")
          .andWhere("students.student_branch_id = :branchId", { branchId: context.branchId })
          .getCount();
      } catch (error) {
        await catchErrors(error, 'studentCount', branchId);
        throw error;
      }
    },
    studentById: async (_parametr: unknown, { Id }: { Id: string }, context: any): Promise<StudentEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors;
      const branchId = context.branchId

      try {
        const studentRepository = AppDataSource.getRepository(StudentEntity)
        let data = await studentRepository.createQueryBuilder("student")
          .leftJoinAndSelect("student.student_group", "student_group")
          .leftJoinAndSelect("student_group.group", "group")
          .leftJoinAndSelect("group.employer", "employer")
          .where("student.student_id = :Id", { Id })
          .getOne()

        if (!data) throw new Error("Student not found");
        return data
      } catch (error) {
        await catchErrors(error, 'studentById', branchId);
        throw error;
      }
    }
  },
  Mutation: {
    addStudent: async (_parent: unknown, { input }: { input: AddStudentInput }, context: any): Promise<StudentEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors;
      const branchId = context.branchId;
      const writeActions = context.writeActions;

      try {
        const studentRepository = AppDataSource.getRepository(StudentEntity);

        let existingStudent = await studentRepository.createQueryBuilder("students")
          .where("students.student_branch_id = :branchId", { branchId })
          .andWhere("students.student_phone = :phone", { phone: input.studentPhone })
          .andWhere("students.student_deleted IS NULL")
          .getOne();

        if (existingStudent) throw new Error(`Student with phone "${input.studentPhone}" already exists`);

        let student = new StudentEntity();
        student.student_name = input.studentName;
        student.student_phone = input.studentPhone;
        student.student_status = 1;
        if (input.studentBithday) {
          student.student_birthday = new Date(input.studentBithday);
        }
        student.student_gender = input.studentGender;
        student.colleague_id = context.colleagueId;
        student.student_branch_id = context.branchId;
        student.parentsInfo = input.parentsInfo;

        let savedStudent = await studentRepository.save(student);

        // Log changes
        const changes = getChanges({}, savedStudent, [
          "student_name",
          "student_phone",
          "student_birthday",
          "student_gender",
          "parentsInfo",
        ]);

        for (const change of changes) {
          await writeActions({
            objectId: savedStudent.student_id,
            eventType: 1,
            eventBefore: change.before || "",
            eventAfter: change.after || "",
            eventObject: "Student",
            eventObjectName: change.field,
            employerId: context.colleagueId,
            employerName: context.colleagueName,
            branchId: branchId,
          });
        }

        // Publish WebSocket event
        pubsub.publish("CREATE_STUDENT", { createStudent: savedStudent });

        return savedStudent;
      } catch (error) {
        await catchErrors(error, "addStudent", branchId, input);
        throw error;
      }
    },
    updateStudent: async (_parent: unknown, { input }: { input: UpdateStudentInput }, context: any): Promise<StudentEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors;
      const branchId = context.branchId;
      const writeActions = context.writeActions;

      try {
        const studentRepository = AppDataSource.getRepository(StudentEntity);

        let student = await studentRepository.createQueryBuilder("students")
          .where("students.student_branch_id = :branchId", { branchId })
          .andWhere("students.student_id = :Id", { Id: input.studentId })
          .andWhere("students.student_deleted IS NULL")
          .getOne();

        if (!student) throw new Error("Student not found");

        const originalStudent = { ...student };
        student.student_name = input.studentName || student.student_name;
        student.student_phone = input.studentPhone || student.student_phone;
        student.student_birthday = input.studentBithday ? new Date(input.studentBithday) : student.student_birthday;
        student.student_gender = input.studentGender || student.student_gender;
        student.parentsInfo = input.parentsInfo || student.parentsInfo;

        const updatedStudent = await studentRepository.save(student);

        // Log changes
        const changes = getChanges(originalStudent, updatedStudent, [
          "student_name",
          "student_phone",
          "student_birthday",
          "student_gender",
          "parentsInfo",
        ]);

        for (const change of changes) {
          await writeActions({
            objectId: updatedStudent.student_id,
            eventType: 2,
            eventBefore: change.before,
            eventAfter: change.after,
            eventObject: "Student",
            eventObjectName: change.field,
            employerId: context.colleagueId,
            employerName: context.colleagueName,
            branchId: branchId,
          });
        }

        // Publish WebSocket event
        pubsub.publish("UPDATE_STUDENT", { updateStudent: updatedStudent });

        return updatedStudent;
      } catch (error) {
        await catchErrors(error, "updateStudent", branchId, input);
        throw error;
      }
    },
    deleteStudent: async (_parent: unknown, { studentId }: { studentId: string }, context: any) => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const branchId = context.branchId;
      const catchErrors = context.catchErrors;
      const writeActions = context.writeActions;

      try {
        const studentRepository = AppDataSource.getRepository(StudentEntity);

        let student = await studentRepository.findOneBy({ student_id: studentId });
        if (!student) throw new Error("Student not found");

        student.student_deleted = new Date();
        await studentRepository.save(student);

        // Log the deletion action
        await writeActions({
          objectId: student.student_id,
          eventType: 3,
          eventBefore: `Name: ${student.student_name}, Phone: ${student.student_phone}`,
          eventAfter: "",
          eventObject: "Student",
          eventObjectName: "deleteStudent",
          employerId: context.colleagueId,
          employerName: context.colleagueName,
          branchId: branchId,
        });

        // Publish WebSocket event
        pubsub.publish("DELETE_STUDENT", { deleteStudent: student });

        return student;
      } catch (error) {
        await catchErrors(error, "deleteStudent", branchId, studentId);
        throw error;
      }
    },
  },
  Subscription: {
    createStudent: {
      subscribe: () => pubsub.asyncIterator("CREATE_STUDENT"),
    },
    updateStudent: {
      subscribe: () => pubsub.asyncIterator("UPDATE_STUDENT"),
    },
    deleteStudent: {
      subscribe: () => pubsub.asyncIterator("DELETE_STUDENT"),
    },
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
      let results = [];
      if (global.student_group && global.student_group.length) {
        for (const i of global.student_group) {
          results.push({
            groupId: i.group.group_id,
            groupName: i.group.group_name,
            colleagueName: i.group.employer.employer_name,
            lessonStartTime: i.group.group_start_time,
          });
        }
      }
      return results;
    },
  },
};

export default resolvers;