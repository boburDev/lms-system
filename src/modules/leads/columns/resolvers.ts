import AppDataSource from "../../../config/ormconfig";
import FunnelColumnsEntity from "../../../entities/funnel/columns.entity";
import { AddFunnelColumnInput, FunnelColumn } from "../../../types/funnel";

const resolvers = {
    Query: {
        funnelColumns: async (_parametr: unknown, { funnelId }: { funnelId: string }, context: any): Promise<FunnelColumnsEntity[]> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const funnelColumnRepository = AppDataSource.getRepository(FunnelColumnsEntity)
            let data = await funnelColumnRepository.createQueryBuilder("funnelColumn")
                .leftJoinAndSelect("funnelColumn.funnels", "funnels")
                .where("funnelColumn.funnel_id = :funnelId", { funnelId: funnelId })
                .andWhere("funnelColumn.funnel_column_deleted IS NULL")
                .orderBy("funnelColumn.funnel_column_created", "DESC")
                .getMany();
            return data
        }
    },
    Mutation: {
        addFunnelColumn: async (_parent: unknown, { input }: { input: AddFunnelColumnInput }, context: any): Promise<FunnelColumnsEntity> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
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