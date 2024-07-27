type AddStudentInput = {
    studentName: string
    studentPhone: string
    studentStatus: number
    studentBithday: string
    studentGender: number
    groupId: string
    addedDate: string
    parentsInfo: [Parent]
}

type UpdateStudentInput = {
    studentId: string
    studentName: string
    studentPhone: string
    studentBithday: string
    studentGender: number
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
    student_group: [{
        group: {
            group_id: string
            group_name: string
            group_start_time: string
            employer: {
                employer_name: string
            }
        }
    }]
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
    UpdateStudentInput,
    StudentAttendenceData
}