import RoomEntity from "../../entities/room.entity";
import AppDataSource from "../../config/ormconfig";
import { AddRoomInput, Room, UpdateRoomInput } from "../../types/room";
import { pubsub } from "../../utils/pubSub";

const resolvers = {
  Query: {
    rooms: async (_parametr: unknown, {}, context:any): Promise<RoomEntity[] | null> => {
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
    roomById: async (_parametr: unknown, { Id }: { Id: string }, context:any): Promise<RoomEntity | null> => {
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
    addRoom: async (_parent: unknown, input: AddRoomInput, context:any): Promise<RoomEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors
      const branchId = context.branchId
      const writeActions = context.writeActions
      try {
        const roomRepository = AppDataSource.getRepository(RoomEntity)

        let data = await roomRepository.createQueryBuilder("room")
          .where("room.room_name = :name", { name: input.roomName })
          .andWhere("room.room_branch_id = :branchId", { branchId })
          .andWhere("room.room_deleted IS NULL")
          .getOne()

        if (data !== null) throw new Error(`Bu uquv markazida "${input.roomName}" nomli hona mavjud`)

        let room = new RoomEntity()
        room.room_name = input.roomName
        room.room_branch_id = branchId
        let result = await roomRepository.save(room)

        pubsub.publish('ROOM_CREATED', {
          createRoom: result
        })
        return result
      } catch (error) {
        await catchErrors(error, 'addRoom', branchId, input)
        throw error;
      }
    },
    updateRoom: async (_parent: unknown, input: UpdateRoomInput, context:any): Promise<RoomEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors
      const branchId = context.branchId
      const writeActions = context.writeActions
      try {
        const roomRepository = AppDataSource.getRepository(RoomEntity)

        let data = await roomRepository.createQueryBuilder("room")
          .where("room.room_id = :Id", { Id: input.roomId })
          .andWhere("room.room_branch_id = :branchId", { branchId })
          .andWhere("room.room_deleted IS NULL")
          .getOne()

        if (!data) throw new Error(`Room not found`)

        data.room_name = input.roomName
        data = await roomRepository.save(data)

        return data
      } catch (error) {
        await catchErrors(error, 'updateRoom', branchId, input) 
        throw error;
      }
    },
    deleteRoom: async (_parent: unknown, input: { roomId: string }, context: any): Promise<RoomEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors
      const branchId = context.branchId
      const writeActions = context.writeActions
      try {
        const roomRepository = AppDataSource.getRepository(RoomEntity)

        let data = await roomRepository.createQueryBuilder("room")
          .where("room.room_id = :id", { id: input.roomId })
          .andWhere("room.room_deleted IS NULL")
          .getOne()

        if (data === null) throw new Error(`Bu hona mavjud emas`)

        data.room_deleted = new Date()
        let result = await roomRepository.save(data)

        pubsub.publish('ROOM_DELETED', {
          deleteRoom: result
        })
        return result
      } catch (error) {
        await catchErrors(error, 'deleteRoom', branchId, input) 
        throw error;
      }
    }
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
  Room:{
    roomId: (global: Room) => global?.room_id,
    roomName: (global: Room) => global?.room_name,
  },

};

export default resolvers;