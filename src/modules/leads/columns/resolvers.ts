import AppDataSource from "../../../config/ormconfig";
import FunnelColumnsEntity from "../../../entities/funnel/columns.entity";
import { AddFunnelColumnInput, FunnelColumn, UpdateFunnelColumnInput } from "../../../types/funnel";

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

            try {
                const funnelColumnRepository = AppDataSource.getRepository(FunnelColumnsEntity)

                let dataFunnelColumn = await funnelColumnRepository.createQueryBuilder("funnelColumn")
                    .where("funnelColumn.funnel_id = :funnelId", { funnelId: input.funnelId })
                    .andWhere("funnelColumn.funnel_column_name = :name", { name: input.funnelColumnName })
                    .andWhere("funnelColumn.funnel_column_deleted IS NULL")
                    .getOne()

                if (dataFunnelColumn !== null) throw new Error("Bu nomdagi varonkani columni mavjud");
                let dataFunnelColumnOrders = await funnelColumnRepository.createQueryBuilder("funnelColumn")
                    .where("funnelColumn.funnel_id = :funnelId", { funnelId: input.funnelId })
                    .andWhere("funnelColumn.funnel_column_deleted IS NULL")
                    .orderBy("funnelColumn.funnel_column_created", "DESC")
                    .getMany()

                let funnelColumn = new FunnelColumnsEntity()
                funnelColumn.funnel_column_name = input.funnelColumnName
                funnelColumn.funnel_column_color = input.funnelColumnColor
                funnelColumn.funnel_column_order = (dataFunnelColumnOrders[0]?.funnel_column_order + 1) || 1
                funnelColumn.funnel_id = input.funnelId
                return await funnelColumnRepository.save(funnelColumn)
            } catch (error) {
                await catchErrors(error, 'addFunnelColumn', branchId, input);
                throw error;
            }


        },
        updateFunnelColumn: async (_parent: unknown, { input }: { input: UpdateFunnelColumnInput }, context: any): Promise<FunnelColumnsEntity> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;

            try {
                const funnelColumnRepository = AppDataSource.getRepository(FunnelColumnsEntity)

                let dataFunnelColumn = await funnelColumnRepository.createQueryBuilder("funnelColumn")
                    .where("funnelColumn.funnel_column_id = :Id", { Id: input.funnelColumnId })
                    .andWhere("funnelColumn.funnel_column_deleted IS NULL")
                    .getOne()
                if (!dataFunnelColumn) throw new Error("Bu nomdagi varonkani columni mavjud emas");

                if (input.funnelColumnOrder) {
                    const currentPosition = dataFunnelColumn.funnel_column_order;
                    let newPosition = input.funnelColumnOrder

                    if (currentPosition === input.funnelColumnOrder) {
                        dataFunnelColumn.funnel_column_name = input.funnelColumnName || dataFunnelColumn.funnel_column_name
                        dataFunnelColumn.funnel_column_color = input.funnelColumnColor || dataFunnelColumn.funnel_column_color
                        dataFunnelColumn.funnel_id = input.funnelId || dataFunnelColumn.funnel_id
                        dataFunnelColumn = await funnelColumnRepository.save(dataFunnelColumn)
                        return dataFunnelColumn;
                    }

                    const funnelColumnRepository1 = AppDataSource.getRepository(FunnelColumnsEntity)
                    let dataFunnelColumnOrders = await funnelColumnRepository1.createQueryBuilder("funnelColumn")
                        .where("funnelColumn.funnel_id = :funnelId", { funnelId: input.funnelId })
                        .andWhere("funnelColumn.funnel_column_deleted IS NULL")
                        .orderBy("funnelColumn.funnel_column_created", "ASC")
                        .getMany()

                    if (newPosition > currentPosition) {
                        for (let order of dataFunnelColumnOrders) {
                            if (order.funnel_column_order > currentPosition && order.funnel_column_order <= newPosition) {
                                order.funnel_column_order--;
                            } else if (order.funnel_column_id === input.funnelColumnId) {
                                order.funnel_column_order = newPosition;
                            }
                        }
                    } else {
                        for (let order of dataFunnelColumnOrders) {
                            if (order.funnel_column_order >= newPosition && order.funnel_column_order < currentPosition) {
                                order.funnel_column_order++;
                            } else if (order.funnel_column_id === input.funnelColumnId) {
                                order.funnel_column_order = newPosition;
                            }
                        }
                    }

                    AppDataSource.transaction(async transactionalEntityManager => {
                        await transactionalEntityManager.save(FunnelColumnsEntity, dataFunnelColumnOrders);
                    });
                    dataFunnelColumn.funnel_column_order = input.funnelColumnOrder
                }

                dataFunnelColumn.funnel_column_name = input.funnelColumnName || dataFunnelColumn.funnel_column_name
                dataFunnelColumn.funnel_column_color = input.funnelColumnColor || dataFunnelColumn.funnel_column_color
                dataFunnelColumn.funnel_id = input.funnelId || dataFunnelColumn.funnel_id
                dataFunnelColumn = await funnelColumnRepository.save(dataFunnelColumn)
                return dataFunnelColumn
            } catch (error) {
                await catchErrors(error, 'updateFunnelColumn', branchId, input);
                throw error;
            }


        },
        deleteFunnelColumn: async (_parent: unknown, { Id }: { Id: string }, context: any): Promise<FunnelColumnsEntity> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;

            try {
                const funnelColumnRepository = AppDataSource.getRepository(FunnelColumnsEntity)
                let dataFunnelColumn = await funnelColumnRepository.createQueryBuilder("funnelColumn")
                    .leftJoinAndSelect("funnelColumn.leads", "leads")
                    .where("funnelColumn.funnel_column_id = :Id", { Id })
                    .andWhere("funnelColumn.funnel_column_deleted IS NULL")
                    .getOne();
                if (!dataFunnelColumn) throw new Error("Bu nomdagi column mavjud emas");

                let funnelColumnLeadsCount = dataFunnelColumn.leads.length

                if (funnelColumnLeadsCount > 0) throw new Error("you can't delete column until you don't delete your leads");
                dataFunnelColumn.funnel_column_deleted = new Date()
                await funnelColumnRepository.save(dataFunnelColumn)
                return dataFunnelColumn
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