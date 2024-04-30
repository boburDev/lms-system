type AddGroupInput = {
    groupName: string
    courseId: string
    employerId: string
    roomId: string
    startDate: string
    endDate: string
    startTime: string
    endTime: string
}

type Group = {
    room_id: string,
    room_name: string
}

export {
    Group,   
    AddGroupInput
}