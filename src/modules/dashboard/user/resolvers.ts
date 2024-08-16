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
            console.log(studentCounts)
            
        },
        employersStatistics: async (_parametr: unknown, input: { startDate: string, endDate: string }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!"); 

            const data = {
                branchId: context.branchId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                // colleagueId: context.colleagueId
            }
            console.log(await getColleagueActivities(data))
            // console.log(context, positionIndicator(context.role));
            
            
        }
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
    const results = await AppDataSource.query(query, params);
    return results;
}

export default resolvers;

// SELECT
// c.*,
//     (SELECT activity_colleagues('2024-01-01T00:00:00.000Z', '2024-12-31T00:00:00.000Z', c.employer_id)) as activity
//         FROM employers c
//         WHERE c.employer_branch_id = '7a738c27-7267-44bb-b768-8cdd202b5e18';