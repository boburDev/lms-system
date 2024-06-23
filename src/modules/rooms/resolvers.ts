import RoomEntity from "../../entities/room.entity";
import AppDataSource from "../../config/ormconfig";
import { AddRoomInput, Room } from "../../types/rooms";

const resolvers = {
  Query: {
    rooms: async (_parametr: unknown, {}, context:any): Promise<RoomEntity[]> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const roomRepository = AppDataSource.getRepository(RoomEntity)

      return await roomRepository.createQueryBuilder("room")
        .where("room.room_branch_id = :branchId", { branchId: context.branchId })
        .andWhere("room.room_deleted IS NULL")
        .orderBy("room.room_created", "DESC")
        .getMany();
    },
  },
  Mutation: {
    addRoom: async (_parent: unknown, { input }: { input: AddRoomInput }, context:any): Promise<RoomEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const roomRepository = AppDataSource.getRepository(RoomEntity)

      let data = await roomRepository.createQueryBuilder("room")
        .where("room.room_name = :name", { name: input.roomName })
        .andWhere("room.room_branch_id = :id", { id: context.branchId })
        .andWhere("room.room_deleted IS NULL")
        .getOne()

      if (data !== null) throw new Error(`Bu uquv markazida "${input.roomName}" nomli hona mavjud`)

      let room = new RoomEntity()
      room.room_name = input.roomName
      room.room_branch_id = context.branchId

      return await roomRepository.save(room)
    },
    deleteRoom: async (_parent: unknown, { roomId }: { roomId: string }, context: any): Promise<RoomEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const roomRepository = AppDataSource.getRepository(RoomEntity)

      let data = await roomRepository.createQueryBuilder("room")
        .where("room.room_id = :id", { id: roomId })
        .andWhere("room.room_deleted IS NULL")
        .getOne()
      
      if (data === null) throw new Error(`Bu hona mavjud emas`)

      data.room_deleted = new Date()
      await roomRepository.save(data)
      return data
    }
  },
  Room:{
    roomId: (global: Room) => global.room_id,
    roomName: (global: Room) => global.room_name,
  }
};

export default resolvers;