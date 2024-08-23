import AppDataSource from "../../../config/ormconfig";
import StudentEntity from "../../../entities/student/students.entity";
import positionIndicator from "../../../utils/status_and_positions";

const startDate = '2024-01-01'; // Replace with your start date
const endDate = '2024-12-31'; // Replace with your end date

const resolvers = {
    Query: {
        studentsStatistics: async (_parametr: unknown, input: { startDate: string, endDate: string }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const studentRepository = AppDataSource.getRepository(StudentEntity)
            const studentCounts = await studentRepository
                .createQueryBuilder('students')
                .select([
                    'COUNT(DISTINCT students.student_id) FILTER (WHERE students.student_deleted IS NULL AND students.student_status = 1) AS "allStudents"',
                    'COUNT(DISTINCT sg.student_group_id) FILTER (WHERE sg.student_group_status = 2 AND sg.student_group_lesson_end BETWEEN :startDate AND :endDate AND sg.student_left_group_time IS NULL) AS "activeStudents"',
                    'COUNT(DISTINCT sg.student_group_id) FILTER (WHERE sg.student_group_status = 3) AS "notPayedStudents"',
                    'COUNT(DISTINCT sg.student_group_id) FILTER (WHERE sg.student_group_status = 4) AS "trialStudents"',
                    'COUNT(DISTINCT sg.student_group_id) FILTER (WHERE EXISTS (SELECT 1 FROM Student_attendences sa WHERE sa.student_attendence_status = 3 AND sa.student_attendence_day BETWEEN :startDate AND :endDate AND sa.student_attendence_student_id = students.student_id)) AS "missedStudents"',
                    'COUNT(DISTINCT sg.student_group_id) FILTER (WHERE sg.student_group_status = 6 AND sg.student_left_group_time IS NOT NULL) AS "leftStudents"',
                    'COUNT(DISTINCT sg.student_group_id) FILTER (WHERE sg.student_group_status = 7) AS "leftTrialStudents"',
                ])
                .leftJoin('students.student_group', 'sg')
                .setParameters({ startDate, endDate })
                .getRawOne();
            return studentCounts
        },
        employersStatistics: async (_parametr: unknown, input: { startDate: string, endDate: string, employerId: string }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const data = {
                branchId: context.branchId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                colleagueId: input.employerId
            }
            let employerData = await getColleagueActivities(data)
            return employerData
        },
        
    },
    StudentInfo: {
        allStudents: (global: any) => global.allStudents,
        activeStudents: (global: any) => global.activeStudents,
        notPayedStudents: (global: any) => global.notPayedStudents,
        trialStudents: (global: any) => global.trialStudents,
        missedStudents: (global: any) => global.missedStudents,
        leftStudents: (global: any) => global.leftStudents,
        leftTrialStudents: (global: any) => global.leftTrialStudents,
        leads: (global: any) => global.leads || 0
    },
    EmployerAppUsage: {
        employerId: (global: any) => global.employer_id,
        employerName: (global: any) => global.employer_name,
        appUsageTime: (global: any) => global.activity,
    }
}

async function getColleagueActivities(input: any) {
    const { branchId, startDate, endDate, colleagueId } = input
    let query = `
        SELECT
            c.*,
            (SELECT activity_colleagues($2, $3, c.employer_id)) as activity
        FROM employers c
        WHERE c.employer_branch_id = $1
    `;

    // Add condition for colleague_id if provided
    const params = [branchId, startDate, endDate];
    if (colleagueId) {
        query += ` AND c.employer_id = $4`;
        params.push(colleagueId);
    }

    console.log(1, branchId, startDate, endDate, colleagueId);
    const results = await AppDataSource.query(query, params);
    return results;
}

export default resolvers;

// SELECT
// c.*,
//     (SELECT activity_colleagues('2024-01-01T00:00:00.000Z', '2024-12-31T00:00:00.000Z', c.employer_id)) as activity
//         FROM employers c
//         WHERE c.employer_branch_id = '7a738c27-7267-44bb-b768-8cdd202b5e18';