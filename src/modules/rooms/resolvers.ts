import RoomEntity from "../../entities/room.entity";
import AppDataSource from "../../config/ormconfig";
import { AddRoomInput, Room, UpdateRoomInput } from "../../types/room";
import { pubsub } from "../../utils/pubSub";
import { IsNull } from "typeorm";
import { getChanges } from "../../utils/eventRecorder";

const resolvers = {
  Query: {
    rooms: async (_parametr: unknown, { }, context: any): Promise<RoomEntity[] | null> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors
      const branchId = context.branchId
      try {
        const roomRepository = AppDataSource.getRepository(RoomEntity)
        return await roomRepository.createQueryBuilder("room")
          .where("room.room_branch_id = :branchId", { branchId })
          .andWhere("room.room_deleted IS NULL")
          .orderBy("room.room_created", "DESC")
          .getMany();
      } catch (error) {
        await catchErrors(error, 'rooms', branchId)
        throw error;
      }
    },
    roomById: async (_parametr: unknown, { Id }: { Id: string }, context: any): Promise<RoomEntity | null> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors
      const branchId = context.branchId
      try {
        const roomRepository = AppDataSource.getRepository(RoomEntity)
        return await roomRepository.createQueryBuilder("room")
          .where("room.room_branch_id = :branchId", { branchId })
          .andWhere("room.room_id = :Id", { Id })
          .andWhere("room.room_deleted IS NULL")
          .getOne();
      } catch (error) {
        await catchErrors(error, 'roomById', branchId)
        throw error;
      }
    },
  },
  Mutation: {
    addRoom: async (_parent: unknown, { input }: { input: AddRoomInput }, context: any): Promise<RoomEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors;
      const branchId = context.branchId;
      const writeActions = context.writeActions;

      try {
        const roomRepository = AppDataSource.getRepository(RoomEntity);

        // Check if room already exists
        const existingRoom = await roomRepository.findOne({ where: { room_name: input.roomName, room_branch_id: branchId, room_deleted: IsNull() } });
        if (existingRoom) throw new Error(`Room "${input.roomName}" already exists`);

        // Create new room
        const room = new RoomEntity();
        room.room_name = input.roomName;
        room.room_branch_id = branchId;
        const result = await roomRepository.save(room);

        // Log creation with writeActions
        const roomChanges = getChanges({}, result, ["room_name"]);
        for (const change of roomChanges) {
          await writeActions({
            objectId: result.room_id,
            eventType: 1,  // Assuming 1 represents "add" actions
            eventBefore: change.before,
            eventAfter: change.after,
            eventObject: "Room",
            eventObjectName: change.field,
            employerId: context.colleagueId,
            employerName: context.colleagueName,
            branchId: branchId
          });
        }

        pubsub.publish('ROOM_CREATED', { createRoom: result });
        return result;
      } catch (error) {
        await catchErrors(error, 'addRoom', branchId, input);
        throw error;
      }
    },
    deleteRoom: async (_parent: unknown, { roomId }: { roomId: string }, context: any): Promise<RoomEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors;
      const branchId = context.branchId;
      const writeActions = context.writeActions;

      try {
        const roomRepository = AppDataSource.getRepository(RoomEntity);

        // Fetch the room to delete
        const data = await roomRepository.findOne({ where: { room_id: roomId, room_deleted: IsNull() } });
        if (!data) throw new Error("Room not found");

        // Preserve original data for logging
        const originalRoom = { ...data };

        // Soft delete the room
        data.room_deleted = new Date();
        const deletedRoom = await roomRepository.save(data);

        // Log deletion
        const roomChanges = getChanges(originalRoom, deletedRoom, ["room_name", "room_deleted"]);
        for (const change of roomChanges) {
          await writeActions({
            objectId: roomId,
            eventType: 3,  // Assuming 3 represents "delete" actions
            eventBefore: change.before,
            eventAfter: change.after,
            eventObject: "Room",
            eventObjectName: "deleteRoom",
            employerId: context.colleagueId,
            employerName: context.colleagueName,
            branchId: branchId
          });
        }

        pubsub.publish('ROOM_DELETED', { deleteRoom: deletedRoom });
        return deletedRoom;
      } catch (error) {
        await catchErrors(error, 'deleteRoom', branchId, { roomId });
        throw error;
      }
    },
  },
  Subscription: {
    createRoom: {
      subscribe: () => pubsub.asyncIterator('ROOM_CREATED')
    },
    editRoom: {
      subscribe: () => pubsub.asyncIterator('ROOM_EDITED')
    },
    deleteRoom: {
      subscribe: () => pubsub.asyncIterator('ROOM_DELETED')
    }
  },
  Room: {
    roomId: (global: Room) => global?.room_id,
    roomName: (global: Room) => global?.room_name,
  },

};

export default resolvers;