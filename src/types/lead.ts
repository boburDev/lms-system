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
    courses: {
        course_name: string
    }
    lead_employer_id: string
    employers: {
        employer_name: string
    }
}

export {
    Lead,
    AddLeadInput
}