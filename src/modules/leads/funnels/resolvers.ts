import { AddFunnelInput, Funnel } from "../../../types/funnel";
import AppDataSource from "../../../config/ormconfig";
import FunnelsEnitity from "../../../entities/funnel/funnels.entity";
import { getChanges } from "../../../utils/eventRecorder";
import { IsNull } from "typeorm";
import { pubsub } from "../../../utils/pubSub";

const resolvers = {
    Query: {
        funnels: async (_parametr: unknown, { }, context: any): Promise<FunnelsEnitity[]> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;

            try {
                const funnelRepository = AppDataSource.getRepository(FunnelsEnitity)
                return await funnelRepository.createQueryBuilder("funnel")
                    .where("funnel.funnel_branch_id = :branchId", { branchId: context.branchId })
                    .andWhere("funnel.funnel_deleted IS NULL")
                    .orderBy("funnel.funnel_created", "DESC")
                    .getMany();
            } catch (error) {
                await catchErrors(error, 'funnels', branchId);
                throw error;
            }

        },
        funnelById: async (_parametr: unknown, { Id }: { Id: string }, context: any): Promise<FunnelsEnitity | null> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;

            try {
                const funnelRepository = AppDataSource.getRepository(FunnelsEnitity)
                return await funnelRepository.createQueryBuilder("funnel")
                    .where("funnel.funnel_id = :Id", { Id })
                    .andWhere("funnel.funnel_deleted IS NULL")
                    .orderBy("funnel.funnel_created", "DESC")
                    .getOne();
            } catch (error) {
                await catchErrors(error, 'funnelById', branchId);
                throw error;
            }


        }
    },
    Mutation: {
        addFunnel: async (_parent: unknown, { input }: { input: AddFunnelInput }, context: any): Promise<FunnelsEnitity> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;
            const writeActions = context.writeActions;

            try {
                const funnelRepository = AppDataSource.getRepository(FunnelsEnitity);

                // Check if a funnel with the same name already exists in the branch
                const existingFunnel = await funnelRepository.findOne({
                    where: { funnel_branch_id: branchId, funnel_name: input.funnelName, funnel_deleted: IsNull() },
                });
                if (existingFunnel) throw new Error("Bu nomdagi varonka mavjud");

                // Create and save the new funnel
                const funnel = new FunnelsEnitity();
                funnel.funnel_name = input.funnelName;
                funnel.funnel_branch_id = branchId;
                const newFunnel = await funnelRepository.save(funnel);

                // Log changes
                const funnelChanges = getChanges({}, newFunnel, ["funnel_name", "funnel_branch_id"]);
                for (const change of funnelChanges) {
                    await writeActions({
                        objectId: newFunnel.funnel_id,
                        eventType: 1, // Assuming 1 represents "add" actions
                        eventBefore: change.before,
                        eventAfter: change.after,
                        eventObject: "Funnel",
                        eventObjectName: change.field,
                        employerId: context.colleagueId || "",
                        employerName: context.colleagueName || "",
                        branchId,
                    });
                }

                // Publish to WebSocket
                pubsub.publish("CREATE_FUNNEL", { createFunnel: newFunnel });

                return newFunnel;
            } catch (error) {
                await catchErrors(error, 'addFunnel', branchId, input);
                throw error;
            }
        },
        updateFunnel: async (_parent: unknown, { input }: { input: AddFunnelInput }, context: any): Promise<FunnelsEnitity> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;
            const writeActions = context.writeActions;

            try {
                const funnelRepository = AppDataSource.getRepository(FunnelsEnitity);

                // Find the funnel to update
                const funnel = await funnelRepository.findOne({
                    where: { funnel_branch_id: branchId, funnel_id: input.funnelId, funnel_deleted: IsNull() },
                });
                if (!funnel) throw new Error("Bu nomdagi varonka mavjud emas");

                // Capture original state for logging
                const originalFunnel = { ...funnel };

                // Update the funnel fields
                funnel.funnel_name = input.funnelName || funnel.funnel_name;
                const updatedFunnel = await funnelRepository.save(funnel);

                // Log changes
                const funnelChanges = getChanges(originalFunnel, updatedFunnel, ["funnel_name"]);
                for (const change of funnelChanges) {
                    await writeActions({
                        objectId: updatedFunnel.funnel_id,
                        eventType: 2, // Assuming 2 represents "update" actions
                        eventBefore: change.before,
                        eventAfter: change.after,
                        eventObject: "Funnel",
                        eventObjectName: change.field,
                        employerId: context.colleagueId || "",
                        employerName: context.colleagueName || "",
                        branchId,
                    });
                }

                // Publish to WebSocket
                pubsub.publish("UPDATE_FUNNEL", { updateFunnel: updatedFunnel });

                return updatedFunnel;
            } catch (error) {
                await catchErrors(error, 'updateFunnel', branchId, input);
                throw error;
            }
        },
        deleteFunnel: async (_parent: unknown, { Id }: { Id: string }, context: any): Promise<FunnelsEnitity> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;
            const writeActions = context.writeActions;

            try {
                const funnelRepository = AppDataSource.getRepository(FunnelsEnitity);

                // Find the funnel to delete
                const funnel = await funnelRepository.findOne({
                    where: { funnel_branch_id: branchId, funnel_id: Id, funnel_deleted: IsNull() },
                });
                if (!funnel) throw new Error("Bu nomdagi varonka mavjud emas");

                // Capture original state for logging
                const originalFunnel = { ...funnel };

                // Mark funnel as deleted
                funnel.funnel_deleted = new Date();
                const deletedFunnel = await funnelRepository.save(funnel);

                // Log deletion
                await writeActions({
                    objectId: deletedFunnel.funnel_id,
                    eventType: 3, // Assuming 3 represents "delete" actions
                    eventBefore: JSON.stringify(originalFunnel),
                    eventAfter: JSON.stringify(deletedFunnel),
                    eventObject: "Funnel",
                    eventObjectName: "deleteFunnel",
                    employerId: context.colleagueId || "",
                    employerName: context.colleagueName || "",
                    branchId,
                });

                // Publish to WebSocket
                pubsub.publish("DELETE_FUNNEL", { deleteFunnel: deletedFunnel });

                return deletedFunnel;
            } catch (error) {
                await catchErrors(error, 'deleteFunnel', branchId, Id);
                throw error;
            }
        },
    },
    Subscription: {
        createFunnel: {
            subscribe: () => pubsub.asyncIterator("CREATE_FUNNEL"),
        },
        updateFunnel: {
            subscribe: () => pubsub.asyncIterator("UPDATE_FUNNEL"),
        },
        deleteFunnel: {
            subscribe: () => pubsub.asyncIterator("DELETE_FUNNEL"),
        },
    },
    Funnel: {
        funnelId: (global: Funnel) => global.funnel_id,
        funnelName: (global: Funnel) => global.funnel_name,
    },
};

export default resolvers;