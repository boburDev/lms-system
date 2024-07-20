type AddRoomInput = {
    roomName: string
}
type UpdateRoomInput = {
    roomId: string
    roomName: string
}

type Room = {
    room_id: string,
    room_name: string
}

export {
    Room,   
    AddRoomInput,
    UpdateRoomInput
}