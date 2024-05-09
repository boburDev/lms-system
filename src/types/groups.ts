type AddGroupInput = {
    groupName: string
    groupDays: [number]
    courseId: string
    employerId: string
    roomId: string
    startDate: string
    endDate: string
    startTime: string
    endTime: string
    lessonCount: number
}

type Group = {
    group_id: string,
    group_name: string,
    group_course_id: string,
    group_course_name: string,
    group_colleague_id: string,
    group_colleague_name: string,
    group_days: string,
    group_room_id: string,
    group_room_name: string,
    group_start_date: string,
    group_end_date: string,
    group_start_time: string,
    group_end_time: string,
    group_lesson_count: string
}

export {
    Group,   
    AddGroupInput
}