type UpdateSalaryInput = {
    salaryId: string
    salaryAmount: number
    salaryType: number
}

type Salary = {
    salary_id: string
    salary_amount: number
    salary_type: number
    employer: {
        employer_id: string
        employer_name: string
    }
}

export {
    Salary,
    UpdateSalaryInput
}