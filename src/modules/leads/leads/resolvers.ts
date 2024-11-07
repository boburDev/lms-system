import LeadsEntity from "../../../entities/funnel/leads.entity";
import AppDataSource from "../../../config/ormconfig";
import { AddLeadInput, Lead, UpdateLeadColumnInput, UpdateLeadInput } from "../../../types/lead";
import EmployersEntity from "../../../entities/employer/employers.entity";
import CoursesEntity from "../../../entities/course.entity";
import FunnelColumnsEntity from "../../../entities/funnel/columns.entity";
import { IsNull } from "typeorm";
import { getChanges } from "../../../utils/eventRecorder";

const resolvers = {
    Query: {
        leads: async (_parametr: unknown, { funnelId }: { funnelId: string }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;

            try {
                const leadRepository = AppDataSource.getRepository(LeadsEntity)
                const funnelColumnRepository = AppDataSource.getRepository(FunnelColumnsEntity)

                let leads = await leadRepository.createQueryBuilder("leads")
                    .leftJoinAndSelect("leads.funnel_columns", "column")
                    .leftJoinAndSelect("leads.employers", "employers")
                    .leftJoinAndSelect("leads.courses", "courses")
                    .where("column.funnel_id = :funnelId", { funnelId: funnelId })
                    .andWhere("column.funnel_column_deleted IS NULL")
                    .andWhere("leads.lead_deleted IS NULL")
                    .orderBy("leads.lead_order", "ASC")
                    .getMany();

                let funnelColumns = await funnelColumnRepository.createQueryBuilder("funnelColumn")
                    .leftJoinAndSelect("funnelColumn.funnels", "funnels")
                    .where("funnelColumn.funnel_id = :funnelId", { funnelId: funnelId })
                    .andWhere("funnelColumn.funnel_column_deleted IS NULL")
                    .orderBy("funnelColumn.funnel_column_order", "ASC")
                    .getMany();
                return {
                    leadList: leads,
                    funnelColumnList: funnelColumns
                }
            } catch (error) {
                await catchErrors(error, 'leads', branchId);
                throw error;
            }
        },
        leadById: async (_parametr: unknown, { Id }: { Id: string }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;

            try {
                const leadRepository = AppDataSource.getRepository(LeadsEntity)

                return await leadRepository.createQueryBuilder("leads")
                    .leftJoinAndSelect("leads.funnel_columns", "column")
                    .leftJoinAndSelect("leads.employers", "employers")
                    .leftJoinAndSelect("leads.courses", "courses")
                    .where("leads.lead_id = :Id", { Id })
                    .andWhere("column.funnel_column_deleted IS NULL")
                    .andWhere("leads.lead_deleted IS NULL")
                    .getOne();
            } catch (error) {
                await catchErrors(error, 'leadById', branchId);
                throw error;
            }


        }
    },
    Mutation: {
        addLead: async (_parent: unknown, { input }: { input: AddLeadInput }, context: any): Promise<LeadsEntity> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;
            const writeActions = context.writeActions;
        
            try {
                const employerRepository = AppDataSource.getRepository(EmployersEntity);
                const courseRepository = AppDataSource.getRepository(CoursesEntity);
        
                // Validate employer
                const employer = await employerRepository.findOne({ where: { employer_id: context.colleagueId, employer_branch_id: branchId, employer_deleted: IsNull() } });
                if (!employer) throw new Error(`Bu Filialda bu hodim mavjud emas`);
        
                // Validate course if provided
                let course = null;
                if (input.courseId) {
                    course = await courseRepository.findOne({ where: { course_id: input.courseId, course_branch_id: branchId, course_deleted: IsNull() } });
                    if (!course) throw new Error(`Bu uquv markazida course mavjud emas`);
                }
        
                const leadRepository = AppDataSource.getRepository(LeadsEntity);
        
                // Get the new order
                const dataLeadOrders = await leadRepository.find({ where: { lead_funnel_column_id: input.columnId, lead_deleted: IsNull() }, order: { lead_created: 'DESC' } });
                const newOrder = dataLeadOrders[0]?.lead_order ? dataLeadOrders[0].lead_order + 1 : 1;
        
                // Create and save the new lead
                const lead = new LeadsEntity();
                lead.lead_order = newOrder;
                lead.lead_name = input.leadName;
                lead.lead_phone = input.leadPhone;
                if (input.courseId) {
                    lead.lead_course_id = input.courseId;
                }
                lead.lead_funnel_id = context.branchId;
                lead.lead_funnel_column_id = input.columnId;
                lead.lead_employer_id = context.colleagueId;
                lead.lead_branch_id = branchId;
        
                const newLead = await leadRepository.save(lead);
        
                // Log creation with writeActions
                const leadChanges = getChanges({}, newLead, ["lead_name", "lead_phone", "lead_course_id", "lead_funnel_column_id", "lead_order"]);
                for (const change of leadChanges) {
                    await writeActions({
                        objectId: newLead.lead_id,
                        eventType: 1,  // Assuming 1 represents "add" actions
                        eventBefore: change.before,
                        eventAfter: change.after,
                        eventObject: "Lead",
                        eventObjectName: change.field,
                        employerId: context.colleagueId,
                        employerName: context.colleagueName,
                        branchId: branchId
                    });
                }
        
                return newLead;
            } catch (error) {
                await catchErrors(error, 'addLead', branchId, input);
                throw error;
            }
        },
        updateLead: async (_parent: unknown, { input }: { input: UpdateLeadInput }, context: any): Promise<LeadsEntity> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;
            const writeActions = context.writeActions;

            try {
                const leadRepository = AppDataSource.getRepository(LeadsEntity);

                // Retrieve the existing lead
                const lead = await leadRepository.findOne({ where: { lead_id: input.leadId, lead_deleted: IsNull() } });
                if (!lead) throw new Error("Lead not found");

                const originalLead = { ...lead };

                // Update lead fields
                lead.lead_name = input.leadName || lead.lead_name;
                lead.lead_phone = input.leadPhone || lead.lead_phone;
                lead.lead_course_id = input.courseId || lead.lead_course_id;

                const updatedLead = await leadRepository.save(lead);

                // Log updates with writeActions
                const leadChanges = getChanges(originalLead, updatedLead, ["lead_name", "lead_phone", "lead_course_id"]);
                for (const change of leadChanges) {
                    await writeActions({
                        objectId: updatedLead.lead_id,
                        eventType: 2,  // Assuming 2 represents "update" actions
                        eventBefore: change.before,
                        eventAfter: change.after,
                        eventObject: "Lead",
                        eventObjectName: change.field,
                        employerId: context.colleagueId,
                        employerName: context.colleagueName,
                        branchId: branchId
                    });
                }

                return updatedLead;
            } catch (error) {
                await catchErrors(error, 'updateLead', branchId, input);
                throw error;
            }
        },
        updateLeadColumn: async (_parent: unknown, { input }: { input: UpdateLeadColumnInput }, context: any): Promise<LeadsEntity> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;
            const writeActions = context.writeActions;

            try {
                const leadRepository = AppDataSource.getRepository(LeadsEntity);

                // Retrieve lead and store original state for logging
                const lead = await leadRepository.findOne({ where: { lead_id: input.leadId, lead_deleted: IsNull() } });
                if (!lead) throw new Error("Lead not found");

                const originalLead = { ...lead };

                // Update lead column and order as necessary
                if (lead.lead_funnel_column_id !== input.columnId) {
                    lead.lead_funnel_column_id = input.columnId;
                    lead.lead_order = input.orderNumber;
                } else if (lead.lead_order !== input.orderNumber) {
                    lead.lead_order = input.orderNumber;
                }

                const updatedLead = await leadRepository.save(lead);

                // Log column and order updates
                const leadChanges = getChanges(originalLead, updatedLead, ["lead_funnel_column_id", "lead_order"]);
                for (const change of leadChanges) {
                    await writeActions({
                        objectId: updatedLead.lead_id,
                        eventType: 2,  // Assuming 2 represents "update" actions
                        eventBefore: change.before,
                        eventAfter: change.after,
                        eventObject: "Lead",
                        eventObjectName: change.field,
                        employerId: context.colleagueId,
                        employerName: context.colleagueName,
                        branchId: branchId
                    });
                }

                return updatedLead;
            } catch (error) {
                await catchErrors(error, 'updateLeadColumn', branchId, input);
                throw error;
            }
        },
        deleteLead: async (_parent: unknown, { leadId }: { leadId: string }, context: any): Promise<LeadsEntity> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;
            const writeActions = context.writeActions;

            try {
                const leadRepository = AppDataSource.getRepository(LeadsEntity);

                // Find the lead to delete and capture its state for logging
                const lead = await leadRepository.findOne({ where: { lead_id: leadId, lead_deleted: IsNull() } });
                if (!lead) throw new Error("Lead not found");

                const originalLead = { ...lead };

                // Mark lead as deleted and reset order
                lead.lead_deleted = new Date();
                lead.lead_order = null;
                await leadRepository.save(lead);

                // Log deletion
                await writeActions({
                    objectId: lead.lead_id,
                    eventType: 3,  // Assuming 3 represents "delete" actions
                    eventBefore: JSON.stringify(originalLead),
                    eventAfter: JSON.stringify(lead),
                    eventObject: "Lead",
                    eventObjectName: "deleteLead",
                    employerId: context.colleagueId,
                    employerName: context.colleagueName,
                    branchId: branchId
                });

                return lead;
            } catch (error) {
                await catchErrors(error, 'deleteLead', branchId, leadId);
                throw error;
            }
        }

    },
    Lead: {
        leadId: (global: Lead) => global.lead_id,
        leadName: (global: Lead) => global.lead_name,
        leadPhone: (global: Lead) => global.lead_phone,
        leadStatus: (global: Lead) => global.lead_status,
        leadOrder: (global: Lead) => global.lead_order,
        leadCreated: (global: Lead) => global.lead_created,
        columnId: (global: Lead) => global.lead_funnel_column_id,
        courseId: (global: Lead) => global.lead_course_id,
        courseName: (global: Lead) => global?.courses?.course_name,
        colleagueId: (global: Lead) => global.lead_employer_id,
        colleagueName: (global: Lead) => global?.employers?.employer_name
    }
}

export default resolvers;