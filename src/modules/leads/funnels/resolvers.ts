import { AddFunnelInput, Funnel } from "../../../types/funnel";
import AppDataSource from "../../../config/ormconfig";
import FunnelsEnitity from "../../../entities/funnel/funnels.entity";

const resolvers = {
    Query: {
        funnels: async (_parametr: unknown, {}, context: any): Promise<FunnelsEnitity[]> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const funnelRepository = AppDataSource.getRepository(FunnelsEnitity)
            return await funnelRepository.createQueryBuilder("funnel")
                .where("funnel.funnel_branch_id = :branchId", { branchId: context.branchId })
                .andWhere("funnel.funnel_deleted IS NULL")
                .orderBy("funnel.funnel_created", "DESC")
                .getMany();
        },
        funnelById: async (_parametr: unknown, { Id }: { Id: string }, context: any): Promise<FunnelsEnitity | null> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const funnelRepository = AppDataSource.getRepository(FunnelsEnitity)
            return await funnelRepository.createQueryBuilder("funnel")
                .where("funnel.funnel_id = :Id", { Id })
                .andWhere("funnel.funnel_deleted IS NULL")
                .orderBy("funnel.funnel_created", "DESC")
                .getOne();
        }
    },
    Mutation: {
        addFunnel: async (_parent: unknown, { input }: { input: AddFunnelInput }, context: any): Promise<FunnelsEnitity> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const funnelRepository = AppDataSource.getRepository(FunnelsEnitity)
            let dataFunnel = await funnelRepository.createQueryBuilder("funnel")
                .where("funnel.funnel_branch_id = :branchId", { branchId: context.branchId })
                .andWhere("funnel.funnel_name = :name", { name: input.funnelName })
                .andWhere("funnel.funnel_deleted IS NULL")
                .getOne()
            if (dataFunnel !== null) throw new Error("Bu nomdagi varonka mavjud");

            let funnel = new FunnelsEnitity()
            funnel.funnel_name = input.funnelName
            funnel.funnel_branch_id = context.branchId
            return await funnelRepository.save(funnel)
        },
        updateFunnel: async (_parent: unknown, { input }: { input: AddFunnelInput }, context: any): Promise<FunnelsEnitity> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const funnelRepository = AppDataSource.getRepository(FunnelsEnitity)
            let dataFunnel = await funnelRepository.createQueryBuilder("funnel")
                .where("funnel.funnel_branch_id = :branchId", { branchId: context.branchId })
                .andWhere("funnel.funnel_id = :Id", { Id: input.funnelId })
                .andWhere("funnel.funnel_deleted IS NULL")
                .getOne()
            if (!dataFunnel) throw new Error("Bu nomdagi varonka mavjud");

            dataFunnel.funnel_name = input.funnelName || dataFunnel.funnel_name
            return await funnelRepository.save(dataFunnel)
        },
        deleteFunnel: async (_parent: unknown, { Id }: { Id: string }, context: any): Promise<FunnelsEnitity> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const funnelRepository = AppDataSource.getRepository(FunnelsEnitity)
            let dataFunnel = await funnelRepository.createQueryBuilder("funnel")
                .where("funnel.funnel_branch_id = :branchId", { branchId: context.branchId })
                .andWhere("funnel.funnel_id = :Id", { Id })
                .andWhere("funnel.funnel_deleted IS NULL")
                .getOne()
            if (!dataFunnel) throw new Error("Bu nomdagi varonka mavjud");

            dataFunnel.funnel_deleted = new Date()
            return await funnelRepository.save(dataFunnel)
        }
    },
    Funnel: {
        funnelId: (global: Funnel) => global.funnel_id,
        funnelName: (global: Funnel) => global.funnel_name,
    }
}

export default resolvers;