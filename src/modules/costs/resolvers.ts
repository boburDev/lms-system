import CostEntity from "../../entities/costs.entity";
import AppDataSource from "../../config/ormconfig";
import { AddCostInput, Cost, UpdateCostInput } from "../../types/cost";

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
      cost.cost_type = input.costType
      cost.cost_payed_at = new Date(input.costSelectedDate)
      cost.colleague_id = input.costColleagueId
      cost.cost_branch_id = context.branchId
      return await costRepository.save(cost)
    },
    updateCost: async (_parent: unknown, { input }: { input: UpdateCostInput }, context: any): Promise<CostEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const costRepository = AppDataSource.getRepository(CostEntity)

      let data = await costRepository.createQueryBuilder("cost")
        .where("cost.cost_id = :Id", { Id: input.costId })
        .andWhere("cost.cost_branch_id = :id", { id: context.branchId })
        .andWhere("cost.cost_deleted IS NULL")
        .getOne()

      if (!data) throw new Error(`Cost not found`)

      data.cost_name = input.costName || data.cost_name
      data.cost_amount = input.costPrice || data.cost_amount
      data.cost_type = input.costType || data.cost_type
      data.cost_payed_at = new Date(input.costSelectedDate) || data.cost_payed_at
      data.colleague_id = input.costColleagueId || data.colleague_id
      return await costRepository.save(data)
    }
  },
  Cost:{
    costId: (global: Cost) => global.cost_id,
    costName: (global: Cost) => global.cost_name,
  }
};

export default resolvers;