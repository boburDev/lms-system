import { AddFunnelInput, Funnel } from "../../../types/funnel";
import AppDataSource from "../../../config/ormconfig";
import FunnelsEnitity from "../../../entities/funnels/funnels.entity";

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
        }
    },
    Funnel: {
        funnelId: (global: Funnel) => global.funnel_id,
        funnelName: (global: Funnel) => global.funnel_name,
    }
}

export default resolvers;