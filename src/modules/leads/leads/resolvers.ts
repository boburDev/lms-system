import LeadsEntity from "../../../entities/funnel/leads.entity";
import AppDataSource from "../../../config/ormconfig";
import { AddLeadInput, Lead, UpdateLeadColumnInput } from "../../../types/lead";
import EmployersEntity from "../../../entities/employer/employers.entity";
import CoursesEntity from "../../../entities/course.entity";
import FunnelColumnsEntity from "../../../entities/funnel/columns.entity";

const resolvers = {
    Query: {
        leads: async (_parametr: unknown, { funnelId }: { funnelId: string }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const leadRepository = AppDataSource.getRepository(LeadsEntity)
            const funnelColumnRepository = AppDataSource.getRepository(FunnelColumnsEntity)
            let result = {
                leadList: [],
                funnelColumnList: []
            }

            let leads = await leadRepository.createQueryBuilder("leads")
                .leftJoinAndSelect("leads.funnel_columns", "column")
                .leftJoinAndSelect("leads.employers", "employers")
                .leftJoinAndSelect("leads.courses", "courses")
                .where("column.funnel_id = :funnelId", { funnelId: funnelId })
                .andWhere("column.funnel_column_deleted IS NULL")
                .andWhere("leads.lead_deleted IS NULL")
                .getMany();
                
            let funnelColumns = await funnelColumnRepository.createQueryBuilder("funnelColumn")
                .leftJoinAndSelect("funnelColumn.funnels", "funnels")
                .where("funnelColumn.funnel_id = :funnelId", { funnelId: funnelId })
                .andWhere("funnelColumn.funnel_column_deleted IS NULL")
                .orderBy("funnelColumn.funnel_column_created", "DESC")
                .getMany();
            // console.log(leads)
            // console.log(funnelColumns)
            return {
                leadList: leads,
                funnelColumnList: funnelColumns
            }
        }
    },
    Mutation: {
        addLead: async (_parent: unknown, { input }: { input: AddLeadInput }, context: any): Promise<LeadsEntity> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const employerRepository = AppDataSource.getRepository(EmployersEntity)
            const courseRepository = AppDataSource.getRepository(CoursesEntity)

            let employer = await employerRepository.createQueryBuilder("employer")
                .where("employer.employer_id = :Id", { Id: context.colleagueId })
                .andWhere("employer.employer_branch_id = :id", { id: context.branchId })
                .andWhere("employer.employer_deleted IS NULL")
                .getOne()

            if (employer == null) throw new Error(`Bu Filialda bu hodim mavjud emas`)

            let course

            if (input.courseId) {
                course = await courseRepository.createQueryBuilder("course")
                    .where("course.course_id = :Id", { Id: input.courseId })
                    .andWhere("course.course_branch_id = :id", { id: context.branchId })
                    .andWhere("course.course_deleted IS NULL")
                    .getOne()
            }
            if (course == null && input.courseId) throw new Error(`Bu uquv markazida course mavjud emas`)

            const leadRepository = AppDataSource.getRepository(LeadsEntity)
            let lead = new LeadsEntity()
            lead.lead_name = input.leadName
            lead.lead_phone = input.leadPhone
            if (input.courseId) {
                lead.lead_course_id = input.courseId
            }
            lead.lead_funnel_column_id = input.columnId
            lead.lead_employer_id = context.colleagueId
            lead.lead_branch_id = context.branchId
            let resData: any = await leadRepository.save(lead)
            resData.employers = employer
            if (course) {
                resData.courses = course
            }
            return resData
        },
        updateLeadColumn: async (_parent: unknown, { input }: { input: UpdateLeadColumnInput }, context: any): Promise<LeadsEntity> => {
            if (!context?.branchId) throw new Error("Not exist access token!");

            const leadRepository = AppDataSource.getRepository(LeadsEntity)

            let data = await leadRepository.createQueryBuilder("leads")
                .where("leads.lead_id = :id", { id: input.leadId })
                .andWhere("leads.lead_deleted IS NULL")
                .getOne()

            if (!data) throw new Error(`Bu lead mavjud emas`)

            data.lead_funnel_column_id = input.columnId
            await leadRepository.save(data)
            return data
        }
    },
    Lead: {
        leadId: (global: Lead) => global.lead_id,
        leadName: (global: Lead) => global.lead_name,
        leadPhone: (global: Lead) => global.lead_phone,
        leadStatus: (global: Lead) => global.lead_status,
        columnId: (global: Lead) => global.lead_funnel_column_id,
        courseId: (global: Lead) => global.lead_course_id,
        courseName: (global: Lead) => global?.courses?.course_name,
        colleagueId: (global: Lead) => global.lead_employer_id,
        colleagueName: (global: Lead) => global?.employers?.employer_name
    }
}

export default resolvers;