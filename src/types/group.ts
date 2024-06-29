import { StudentAttendenceData } from "./student"

type AddGroupInput = {
    Id: string
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
    course: {
        course_name: string
    },
    group_colleague_id: string,
    employer: {
        employer_name: string
    },
    group_days: string,
    group_room_id: string,
    room: {
        room_name: string
    },
    group_start_date: string,
    group_end_date: string,
    group_start_time: string,
    group_end_time: string,
    group_lesson_count: string,
    attendence: [Attendence]
    student_attendences: [StudentAttendenceData],
    student_group: [StudentGroupInfo]
}

type StudentGroupInfo = {
    student_group_id: string
    student: {
        student_name: string
    }
    student_group_add_time: string
    student_group_status: number
    student_group_credit: number
}

type Attendence = {
    group_attendence_id: string,
    group_attendence_day: string,
    group_attendence_status: number,
    group_attendence_group_id: string
}

type AddStudentGroupInput = {
    studentId: string
    groupId: string
    addedDate: string
}

export {
    Group,   
    AddGroupInput,
    AddStudentGroupInput
}
