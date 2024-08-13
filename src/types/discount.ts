type AddDiscountInput = {
    studentId: string
    groupId: string
    discountAmount: number
    discountType: number
    discountStartDate: string
    discountEndDate: string
}

type RemoveGroupDiscountInput = {
    studentId: string
    groupId: string
}

type Discount = {
    student_id: string
    student: {
        student_name: string,
        student_phone: string,
    },
    group_id: string
    student_group_discount: number
    student_group_discount_type: number
    student_group_discount_start: string
    student_group_discount_end: string
}

export {
    Discount,
    AddDiscountInput,
    RemoveGroupDiscountInput
}