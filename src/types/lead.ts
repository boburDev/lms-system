type AddLeadInput = {
    leadName: string
    leadPhone: string
    columnId: string
    courseId: string
}

type Lead = {
    lead_id: string
    lead_name: string
    lead_phone: string
    lead_status: number
    lead_funnel_column_id: string
    lead_course_id: string
    course: {
        course_name: string
    }
    lead_employer_id: string
    employer: {
        employer_name: string
    }
}

export {
    Lead,
    AddLeadInput
}