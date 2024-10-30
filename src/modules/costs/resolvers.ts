import CostEntity from "../../entities/costs.entity";
import AppDataSource from "../../config/ormconfig";
import { AddCostInput, Cost, UpdateCostInput } from "../../types/cost";
import { costTypes } from "../../utils/status_and_positions";

const resolvers = {
  Query: {
    costs: async (_parametr: unknown, input: { startDate: string, endDate: string }, context: any) => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors;
      const branchId = context.branchId;

      try {
        const costRepository = AppDataSource.getRepository(CostEntity);

        let startDate = input.startDate ? new Date(input.startDate) : null;
        let endDate = input.endDate ? new Date(input.endDate) : null;

        let query = await costRepository.createQueryBuilder("cost")
          .where("cost.cost_branch_id = :branchId", { branchId })
          .andWhere("cost.cost_deleted IS NULL");

        if (startDate instanceof Date && endDate instanceof Date) {
          query = query.andWhere("cost.cost_created BETWEEN :startDate AND :endDate", {
            startDate,
            endDate
          });
        }

        let data = await query
          .orderBy("cost.cost_created", "DESC")
          .getMany();

        return {
          Costs: data,
          Sum: 0 // Calculate the sum if needed
        };
      } catch (error) {
        await catchErrors(error, 'costs', branchId);
        throw error;
      }
    },

    costById: async (_parametr: unknown, { Id }: { Id: string }, context: any): Promise<CostEntity | null> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors;
      const branchId = context.branchId;

      try {
        const costRepository = AppDataSource.getRepository(CostEntity);

        let data = await costRepository.createQueryBuilder("cost")
          .where("cost.cost_id = :Id", { Id })
          .andWhere("cost.cost_branch_id = :id", { id: context.branchId })
          .andWhere("cost.cost_deleted IS NULL")
          .getOne();

        return data;
      } catch (error) {
        await catchErrors(error, 'costById', branchId);
        throw error;
      }
    },
  },

  Mutation: {
    addCost: async (_parent: unknown, { input }: { input: AddCostInput }, context: any): Promise<CostEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors;
      const branchId = context.branchId;
      const writeActions = context.writeActions;

      try {
        const costRepository = AppDataSource.getRepository(CostEntity);
        let costType = costTypes(input.costType);

        let cost = new CostEntity();
        cost.cost_name = input.costName;
        cost.cost_amount = input.costPrice;
        cost.cost_type = Number(costType);

        if (costType == 5) {
          cost.cost_type_value = input.costType;
        }

        cost.cost_payed_at = new Date(input.costPayedAt);
        cost.colleague_id = input.costColleagueId;
        cost.cost_branch_id = context.branchId;

        let result = await costRepository.save(cost);
        let actionArgs = {
          objectId: result.cost_id,
          eventType: 1,
          eventBefore: "",
          eventAfter: input.costName,
          eventObject: "cost",
          employerId: context.colleagueId,
          employerName: context.colleagueName,
          branchId: branchId
        };

        await writeActions(actionArgs);
        return result;
      } catch (error) {
        await catchErrors(error, 'addCost', branchId, input);
        throw error;
      }
    },

    updateCost: async (_parent: unknown, { input }: { input: UpdateCostInput }, context: any): Promise<CostEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors;
      const branchId = context.branchId;
      const writeActions = context.writeActions;

      try {
        const costRepository = AppDataSource.getRepository(CostEntity);

        let data = await costRepository.createQueryBuilder("cost")
          .where("cost.cost_id = :Id", { Id: input.costId })
          .andWhere("cost.cost_branch_id = :branchId", { branchId })
          .andWhere("cost.cost_deleted IS NULL")
          .getOne();

        if (!data) throw new Error(`Cost not found`);

        let actionArgs = {
          objectId: input.costId,
          eventType: 2,
          eventBefore: data.cost_name,
          eventAfter: input.costName,
          eventObject: "cost",
          employerId: context.colleagueId,
          employerName: context.colleagueName,
          branchId: branchId
        };

        let costType = costTypes(input.costType);
        data.cost_name = input.costName || data.cost_name;
        data.cost_amount = input.costPrice || data.cost_amount;
        data.cost_type = Number(costType) || data.cost_type;

        if (costType == 5) {
          data.cost_type_value = input.costType || data.cost_type_value;
        }

        data.cost_payed_at = new Date(input.costPayedAt) || data.cost_payed_at;
        data.colleague_id = input.costColleagueId || data.colleague_id;

        let result = await costRepository.save(data);
        await writeActions(actionArgs); // Log the update action
        return result;
      } catch (error) {
        await catchErrors(error, 'updateCost', branchId, input);
        throw error;
      }
    },

    deleteCost: async (_parent: unknown, { Id }: { Id: string }, context: any): Promise<CostEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const costRepository = AppDataSource.getRepository(CostEntity);

      try {
        let data = await costRepository.createQueryBuilder("cost")
          .where("cost.cost_id = :Id", { Id })
          .andWhere("cost.cost_branch_id = :id", { id: context.branchId })
          .andWhere("cost.cost_deleted IS NULL")
          .getOne();

        if (!data) throw new Error(`Cost not found`);

        data.cost_deleted = new Date();
        return await costRepository.save(data);
      } catch (error) {
        await context.catchErrors(error, 'deleteCost', context.branchId);
        throw error;
      }
    }
  },

  Cost: {
    costId: (global: Cost) => global.cost_id,
    costName: (global: Cost) => global.cost_name,
    costType: (global: Cost) => costTypes(global.cost_type),
    costPrice: (global: Cost) => global.cost_amount,
    costPayedAt: (global: Cost) => global.cost_payed_at,
    costCreated: (global: Cost) => global.cost_created,
  }
};

export default resolvers;
