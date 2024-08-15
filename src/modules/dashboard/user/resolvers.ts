import AppDataSource from "../../../config/ormconfig";
import StudentEntity from "../../../entities/student/students.entity";

const resolvers = {
    Query: {
        studentsStatistics: async (_parametr: unknown, input: { startDate: string, endDate: string }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const studentRepository = AppDataSource.getRepository(StudentEntity)

            const startDate = '2024-01-01'; // Replace with your start date
            const endDate = '2024-12-31'; // Replace with your end date

            const studentCounts = await studentRepository
                .createQueryBuilder('students')
                .select([
                    'COUNT(DISTINCT students.student_id) FILTER (WHERE students.student_deleted IS NULL AND students.student_status = 1) AS "allStudents"',
                    'COUNT(DISTINCT sg.student_group_id) FILTER (WHERE sg.student_group_status = 2 AND sg.student_group_lesson_end BETWEEN :startDate AND :endDate AND sg.student_left_group_time IS NULL) AS "activeStudents"',
                    'COUNT(DISTINCT sg.student_group_id) FILTER (WHERE sg.student_group_status = 3) AS "notPayedStudents"',
                    'COUNT(DISTINCT sg.student_group_id) FILTER (WHERE sg.student_group_status = 4) AS "trialStudents"',
                    'COUNT(DISTINCT sg.student_group_id) FILTER (WHERE sg.student_group_status = 5 AND EXISTS (SELECT 1 FROM Student_attendences sa WHERE sa.student_attendence_status = 3 AND sa.student_attendence_day BETWEEN :startDate AND :endDate AND sa.student_attendence_student_id = students.student_id)) AS "trialStudentsWithAttendance"',
                    'COUNT(DISTINCT sg.student_group_id) FILTER (WHERE sg.student_group_status = 6 AND sg.student_left_group_time IS NOT NULL) AS "leftStudents"',
                    'COUNT(DISTINCT sg.student_group_id) FILTER (WHERE sg.student_group_status = 7) AS "leftTrialStudents"',
                ])
                .leftJoin('students.student_group', 'sg')
                .setParameters({ startDate, endDate })
                .getRawOne();
            console.log(studentCounts)
            
        },
    },
    StudentInfo: {
        allStudents: (global: any) => 0,
        activeStudents: (global: any) => 0,
        notPayedStudents: (global: any) => 0,
        trialStudents: (global: any) => 0,
        missedStudents: (global: any) => 0,
        leftStudents: (global: any) => 0,
        leftTrialStudents: (global: any) => 0,
        leads: (global: any) => 0
    }
}

export default resolvers;