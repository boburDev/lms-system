type updateStudentAttendenceStatus = {
    attendId: string
    groupId: string
    attendStatus: number
    studentId: string
}

type updateGroupAttendanceStatus = {
    attendId: string
    groupId: string
    attendStatus: number
}

export {
    updateStudentAttendenceStatus,
    updateGroupAttendanceStatus
}