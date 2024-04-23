import RoomEntity from "../../entities/room.entity";
import AppDataSource from "../../config/ormconfig";
import { AddRoomInput, Room } from "../../types/rooms";

const resolvers = {
  Query: {
    rooms: async (_parametr: unknown, {}, context:any): Promise<RoomEntity[]> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const roomRepository = AppDataSource.getRepository(RoomEntity)
      return await roomRepository.find({ where: { room_branch_id: context.branchId } })
    },
  },
  Mutation: {
    addRoom: async (_parent: unknown, { input }: { input: AddRoomInput }, context:any): Promise<RoomEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const roomRepository = AppDataSource.getRepository(RoomEntity)

      let data = await roomRepository.findOneBy({ room_name: input.roomName, room_branch_id: context.branchId })
      if (data !== null) throw new Error(`Bu uquv markazida "${input.roomName}" nomli hona mavjud`)

      let room = new RoomEntity()
      room.room_name = input.roomName
      room.room_branch_id = context.branchId

      return await roomRepository.save(room)
    }
  },
  Room:{
    roomId: (global: Room) => global.room_id,
    roomName: (global: Room) => global.room_name,
  }
};

export default resolvers;