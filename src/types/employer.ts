import { Permission } from "../modules/employers/resolvers"

type AddEmployerInput = {
    employerName: string
    employerPhone: string
    employerPosition: string
    employerPassword: string
    employerBranchId: string
    employerGender: string
    employerBirthday: string
    employerPermission: string
}

type UpdateEmployerInput = {
    employerId: string
    employerName: string
    employerPhone: string
    employerPosition: string
    employerPassword: string
    employerBranchId: string
    employerGender: string
    employerBirthday: string
    employerPermission: string
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
    permissions: Permission
}

export {
    Employer,
    AddEmployerInput,
    UpdateEmployerInput,
    UpdateEmployerProfileInput
}
