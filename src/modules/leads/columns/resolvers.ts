import { IsNull } from "typeorm";
import AppDataSource from "../../../config/ormconfig";
import FunnelColumnsEntity from "../../../entities/funnel/columns.entity";
import { AddFunnelColumnInput, FunnelColumn, UpdateFunnelColumnInput } from "../../../types/funnel";
import { getChanges } from "../../../utils/eventRecorder";

const resolvers = {
    Query: {
        funnelColumns: async (_parametr: unknown, { funnelId }: { funnelId: string }, context: any): Promise<FunnelColumnsEntity[]> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;

            try {
                const funnelColumnRepository = AppDataSource.getRepository(FunnelColumnsEntity)
                let data = await funnelColumnRepository.createQueryBuilder("funnelColumn")
                    .leftJoinAndSelect("funnelColumn.funnels", "funnels")
                    .where("funnelColumn.funnel_id = :funnelId", { funnelId: funnelId })
                    .andWhere("funnelColumn.funnel_column_deleted IS NULL")
                    .orderBy("funnelColumn.funnel_column_created", "DESC")
                    .getMany();
                return data
            } catch (error) {
                await catchErrors(error, 'funnelColumns', branchId);
                throw error;
            }


        },
        funnelColumnById: async (_parametr: unknown, { funnelColumnId }: { funnelColumnId: string }, context: any): Promise<FunnelColumnsEntity | null> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;

            try {
                const funnelColumnRepository = AppDataSource.getRepository(FunnelColumnsEntity)
                return await funnelColumnRepository.createQueryBuilder("funnelColumn")
                    .where("funnelColumn.funnel_column_id = :funnelColumnId", { funnelColumnId })
                    .andWhere("funnelColumn.funnel_column_deleted IS NULL")
                    .getOne();
            } catch (error) {
                await catchErrors(error, 'funnelColumnById', branchId);
                throw error;
            }


        }
    },
    Mutation: {
        addFunnelColumn: async (_parent: unknown, { input }: { input: AddFunnelColumnInput }, context: any): Promise<FunnelColumnsEntity> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;
            const writeActions = context.writeActions;

            try {
                const funnelColumnRepository = AppDataSource.getRepository(FunnelColumnsEntity);

                let dataFunnelColumn = await funnelColumnRepository.createQueryBuilder("funnelColumn")
                    .where("funnelColumn.funnel_id = :funnelId", { funnelId: input.funnelId })
                    .andWhere("funnelColumn.funnel_column_name = :name", { name: input.funnelColumnName })
                    .andWhere("funnelColumn.funnel_column_deleted IS NULL")
                    .getOne();

                if (dataFunnelColumn !== null) throw new Error("Bu nomdagi varonkani columni mavjud");

                let funnelColumn = new FunnelColumnsEntity();
                funnelColumn.funnel_column_name = input.funnelColumnName;
                funnelColumn.funnel_column_color = input.funnelColumnColor;
                funnelColumn.funnel_column_order = (await funnelColumnRepository.count({ where: { funnel_id: input.funnelId } })) + 1;
                funnelColumn.funnel_id = input.funnelId;

                let savedFunnelColumn = await funnelColumnRepository.save(funnelColumn);

                // Log the addition of the new funnel column
                const funnelColumnChanges = getChanges({}, savedFunnelColumn, ["funnel_column_name", "funnel_column_color", "funnel_column_order", "funnel_id"]);
                for (const change of funnelColumnChanges) {
                    await writeActions({
                        objectId: savedFunnelColumn.funnel_column_id,
                        eventType: 1,
                        eventBefore: change.before,
                        eventAfter: change.after,
                        eventObject: "FunnelColumn",
                        eventObjectName: change.field,
                        employerId: context.colleagueId || "",
                        employerName: context.colleagueName || "",
                        branchId: branchId
                    });
                }

                return savedFunnelColumn;
            } catch (error) {
                await catchErrors(error, 'addFunnelColumn', branchId, input);
                throw error;
            }
        },
        updateFunnelColumn: async (_parent: unknown, { input }: { input: UpdateFunnelColumnInput }, context: any): Promise<FunnelColumnsEntity> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;
            const writeActions = context.writeActions;

            try {
                const funnelColumnRepository = AppDataSource.getRepository(FunnelColumnsEntity);

                let dataFunnelColumn = await funnelColumnRepository.findOneBy({ funnel_column_id: input.funnelColumnId, funnel_column_deleted: IsNull() });
                if (!dataFunnelColumn) throw new Error("Bu nomdagi varonkani columni mavjud emas");

                const originalFunnelColumn = { ...dataFunnelColumn };

                dataFunnelColumn.funnel_column_name = input.funnelColumnName || dataFunnelColumn.funnel_column_name;
                dataFunnelColumn.funnel_column_color = input.funnelColumnColor || dataFunnelColumn.funnel_column_color;
                dataFunnelColumn.funnel_column_order = input.funnelColumnOrder || dataFunnelColumn.funnel_column_order;

                let updatedFunnelColumn = await funnelColumnRepository.save(dataFunnelColumn);

                // Log the updates to the funnel column
                const funnelColumnChanges = getChanges(originalFunnelColumn, updatedFunnelColumn, ["funnel_column_name", "funnel_column_color", "funnel_column_order"]);
                for (const change of funnelColumnChanges) {
                    await writeActions({
                        objectId: updatedFunnelColumn.funnel_column_id,
                        eventType: 2,
                        eventBefore: change.before,
                        eventAfter: change.after,
                        eventObject: "FunnelColumn",
                        eventObjectName: change.field,
                        employerId: context.colleagueId || "",
                        employerName: context.colleagueName || "",
                        branchId: branchId
                    });
                }

                return updatedFunnelColumn;
            } catch (error) {
                await catchErrors(error, 'updateFunnelColumn', branchId, input);
                throw error;
            }
        },
        deleteFunnelColumn: async (_parent: unknown, { Id }: { Id: string }, context: any): Promise<FunnelColumnsEntity> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;
            const writeActions = context.writeActions;

            try {
                const funnelColumnRepository = AppDataSource.getRepository(FunnelColumnsEntity);

                let dataFunnelColumn = await funnelColumnRepository.createQueryBuilder("funnelColumn")
                    .leftJoinAndSelect("funnelColumn.leads", "leads")
                    .where("funnelColumn.funnel_column_id = :Id", { Id })
                    .andWhere("funnelColumn.funnel_column_deleted IS NULL")
                    .getOne();

                if (!dataFunnelColumn) throw new Error("Bu nomdagi column mavjud emas");

                if (dataFunnelColumn.leads.length > 0) throw new Error("you can't delete column until you don't delete your leads");

                const originalFunnelColumn = { ...dataFunnelColumn };

                dataFunnelColumn.funnel_column_deleted = new Date();
                let deletedFunnelColumn = await funnelColumnRepository.save(dataFunnelColumn);

                // Log the deletion of the funnel column
                await writeActions({
                    objectId: deletedFunnelColumn.funnel_column_id,
                    eventType: 3,
                    eventBefore: JSON.stringify(originalFunnelColumn),
                    eventAfter: "",
                    eventObject: "FunnelColumn",
                    eventObjectName: "deleteFunnelColumn",
                    employerId: context.colleagueId || "",
                    employerName: context.colleagueName || "",
                    branchId: branchId
                });

                return deletedFunnelColumn;
            } catch (error) {
                await catchErrors(error, 'deleteFunnelColumn', branchId, Id);
                throw error;
            }
        }
    },
    FunnelColumn: {
        funnelColumnId: (global: FunnelColumn) => global.funnel_column_id,
        funnelColumnName: (global: FunnelColumn) => global.funnel_column_name,
        funnelColumnColor: (global: FunnelColumn) => global.funnel_column_color,
        funnelColumnOrder: (global: FunnelColumn) => global.funnel_column_order,
        funnelId: (global: FunnelColumn) => global.funnel_id,
    }
}

export default resolvers;