\c postgres
drop database crm;
CREATE DATABASE crm;
\c crm

ALTER USER postgres WITH PASSWORD 'bobur1907';

drop table company_branches, costs, courses, employers, group_attendences,
groups, rooms, student_cashes, student_payments, students cascade;

findCalendar: `
        select
            to_char(se.edu_group_attendence_day, 'YYYY-MM-DD') as date,
            se.edu_group_attendence_day,
            json_agg(se.*) as action
        from (
            SELECT
                egt.*,
                eg.*,
                cc.*,
                ar.*,
                ec.*
            FROM 
                edu_group_attendences as egt
            inner join edu_groups as eg
                on eg.edu_group_id = edu_group_attendence_group_id
            inner join company_colleagues as cc
                on cc.company_colleague_id = eg.edu_teacher_id
            where edu_group_attendence_day >= $1::timestamp and edu_group_attendence_day <= $2::timestamp and egt.company_branch_id::text = $3
        ) as se
        group by se.edu_group_attendence_day
 
    `,

    findCalendar: async (_, args, { branchId, psql }) => {
            try {
                // let month = timeZone(args.month).split("T")[0] + " 00:00:00+05"
                
                const monthly = await psql.fetchAll(group.findCalendar, timeZone(args.startDate), timeZone(args.endDate), branchId)
                // console.log(monthly)

                const result = []

                for(let day of monthly) {
                    let obj = {
                        date: day.date,
                        action: []
                    }
                    for(let d of day.action) {
                        let foundGroup = await psql.fetch(group.findSimpleGroup, d.edu_group_id)
                        let days = foundGroup.edu_group_days.split(" ")
                        let a = new Date(timeZone(d.edu_group_attendence_day))

                        if(days.includes(a.getDay() + "")) {
                            obj.action.push(d)
                        }

                    }
                    // console.log(obj)
                    result.push(obj)
                }

                return result

            } catch (err) {
                return err
            }
        }