import CostEntity from "../../entities/costs.entity";
import AppDataSource from "../../config/ormconfig";
import { AddCostInput, Cost, UpdateCostInput } from "../../types/cost";
import { costTypes } from "../../utils/status_and_positions";

const resolvers = {
  Query: {
    costs: async (_parametr: unknown, input: { startDate: string, endDate: string }, context: any) => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const costRepository = AppDataSource.getRepository(CostEntity)

      let startDate = input.startDate ? new Date(input.startDate) : null
      let endDate = input.endDate ? new Date(input.endDate) : null

      let query = await costRepository.createQueryBuilder("cost")
        .where("cost.cost_branch_id = :id", { id: context.branchId })
        .andWhere("cost.cost_deleted IS NULL")
      if (startDate instanceof Date && endDate instanceof Date) {
        query = query.andWhere("cost.cost_created BETWEEN :startDate AND :endDate", {
          startDate,
          endDate
        })
      }
      let data = await query
        .orderBy("cost.cost_created", "DESC")
        .getMany()

      return {
        Costs: data,
        Sum: 0
      }
    },
    costById: async (_parametr: unknown, { Id }: { Id: string }, context: any): Promise<CostEntity | null> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const costRepository = AppDataSource.getRepository(CostEntity)

      let data = await costRepository.createQueryBuilder("cost")
        .where("cost.cost_id = :Id", { Id })
        .andWhere("cost.cost_branch_id = :id", { id: context.branchId })
        .andWhere("cost.cost_deleted IS NULL")
        .getOne()

      return data
    },
  },
  Mutation: {
    addCost: async (_parent: unknown, { input }: { input: AddCostInput }, context: any): Promise<CostEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const costRepository = AppDataSource.getRepository(CostEntity)
      let costType = costTypes(input.costType)

      let cost = new CostEntity()
      cost.cost_name = input.costName
      cost.cost_amount = input.costPrice
      cost.cost_type = Number(costType)
      if (costType == 5) {
        cost.cost_type_value = input.costType
      }
      cost.cost_payed_at = new Date(input.costPayedAt)
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
      let costType = costTypes(input.costType)
      data.cost_name = input.costName || data.cost_name
      data.cost_amount = input.costPrice || data.cost_amount
      data.cost_type = Number(costType) || data.cost_type
      if (costType == 5) {
        data.cost_type_value = input.costType || data.cost_type_value
      }
      data.cost_payed_at = new Date(input.costPayedAt) || data.cost_payed_at
      data.colleague_id = input.costColleagueId || data.colleague_id
      return await costRepository.save(data)
    },
    deleteCost: async (_parent: unknown, { Id }: { Id: string }, context: any): Promise<CostEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const costRepository = AppDataSource.getRepository(CostEntity)

      let data = await costRepository.createQueryBuilder("cost")
        .where("cost.cost_id = :Id", { Id })
        .andWhere("cost.cost_branch_id = :id", { id: context.branchId })
        .andWhere("cost.cost_deleted IS NULL")
        .getOne()

      if (!data) throw new Error(`Cost not found`)

      data.cost_deleted = new Date()
      return await costRepository.save(data)
    }
  },
  Cost:{
    costId: (global: Cost) => global.cost_id,
    costName: (global: Cost) => global.cost_name,
    costType: (global: Cost) => costTypes(global.cost_type),
    costPrice: (global: Cost) => global.cost_amount,
    costPayedAt: (global: Cost) => global.cost_payed_at,
    costCreated: (global: Cost) => global.cost_created,
  }
};

export default resolvers;