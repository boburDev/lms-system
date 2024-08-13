type AddstudentPayment = {
    studentId: string
    cashAmount: number
    paymentType: string
    payedAt: string
}

type studentPayment = {
    cash_amount: number
    check_number: number
    cash_type: number
    student_cash_id: string
    student_cash_payed_at: string
    student_cash_created: string
    student_id: string
    student_name: string
    student_phone: string
    employer_name: string
}

export {
    AddstudentPayment,
    studentPayment
}