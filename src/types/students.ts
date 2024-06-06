type AddStudentInput = {
    studentName: string
    studentPhone: string
    studentPassword: string
    studentStatus: number
    studentCash: number
    studentCashType: number
    studentBalance: number
    studentBithday: string
    studentGender: number
    groupId: string
    addedDate: string
    colleagueId: string
    parentsInfo: [Parent]
}

type Parent = {
    parentName: string
    parentPhone: string
}

type Student = {
    student_id: string,
    student_name: string
    student_phone: string
    student_gender: number
    student_birthday: number
    student_status: number
    student_balance: number
    colleague_id: string
}

type ParentInfo = {
    parentName: string
    parentPhone: string
}

type StudentAttendenceData =  {
    student_id: string
    student_name: string
    student_days: [StudentAttendence]
}

type StudentAttendence = {
    student_attendence_id: string,
    student_attendence_day: string,
    student_attendence_status: number,
    student_attendence_group_id: string
}


export {
    Student,
    ParentInfo,
    AddStudentInput,
    StudentAttendenceData
}