type AddEmployerInput = {
    employerName: string
    employerPhone: string
    employerPosition: string
    employerPassword: string
    employerBranchId: string
}

type UpdateEmployerProfileInput = {
    employerId: string
    employerName: string
    employerPhone: string
    employerBirthday: string
    employerGender: number
    employerLang: string
}

type Employer = {
    employer_id: string
    employer_name: string
    employer_phone: string
    employer_birthday: string
    employer_gender: string
    employer_position: string
    employer_usage_lang: string
    employer_created: string
    employer_deleted: string
    employer_branch_id: string
}

export {
    Employer,
    AddEmployerInput,
    UpdateEmployerProfileInput
}
