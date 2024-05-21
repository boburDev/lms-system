type AddStudentInput = {
    studentName: string
    studentPhone: string
    studentPassword: string
    studentStatus: number
    studentBalance: number
    studentBithday: string
    studentGender: number
    groupId: string
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

export {
    Student,
    ParentInfo,
    AddStudentInput
}