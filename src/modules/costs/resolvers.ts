import CostEntity from "../../entities/costs.entity";
import AppDataSource from "../../config/ormconfig";
import { AddCostInput } from "../../types/cost";

const resolvers = {
  Query: {
    costs: async (_parametr: unknown, { }, context: any): Promise<CostEntity[]> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const costRepository = AppDataSource.getRepository(CostEntity)
      return await costRepository.find({
        where: { cost_branch_id: context.branchId },
        order: { cost_created: "DESC" }
      })
    },
  },
  Mutation: {
    addCost: async (_parent: unknown, { input }: { input: AddCostInput }, context: any): Promise<CostEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const costRepository = AppDataSource.getRepository(CostEntity)

      let cost = new CostEntity()
      cost.cost_name = input.costName
      cost.cost_amount = input.costPrice
      cost.colleague_id = input.costColleagueId
      cost.cost_payed_at = new Date(input.costPayed)
      cost.cost_branch_id = context.branchId

      return await costRepository.save(cost)
    }
  },
  Room:{
    roomId: (global: Room) => global.room_id,
    roomName: (global: Room) => global.room_name,
  }
};

export default resolvers;