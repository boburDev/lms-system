let permissions = {
    dashboard: {
        students_stat: { isRead: false },
        colleaue_stat: { isRead: false, isAll: false },
        client_stat: { isRead: false }
    },
    leads: {
        funnels: { isCreate: false, isUpdate: false, isDelete: false, isRead: false },
        columns: { isCreate: false, isUpdate: false, isDelete: false, isRead: false },
        leads: { isCreate: false, isUpdate: false, isDelete: false, isRead: false, isExport: false, isImport: false }
    },
    calendar: { isCreate: false, isUpdate: false, isDelete: false, isRead: false },
    students: {
        students: { isCreate: false, isUpdate: false, isDelete: false, isRead: false, isExport: false, isImport: false },
        payments: { isCreate: false, isUpdate: false, isRead: false },
        groups: { isCreate: false, isUpdate: false, isDelete: false, isRead: false },
        discounts: { isUpdate: false, isDelete: false, isRead: false }
    },
    groups: {
        groups: { isCreate: false, isUpdate: false, isDelete: false, isRead: false },
        attendance: { isUpdate: false, isRead: false }
    },
    employers: { isCreate: false, isUpdate: false, isDelete: false, isRead: false, isRecover: false },
    courses: { isCreate: false, isUpdate: false, isDelete: false, isRead: false },
    rooms: { isCreate: false, isUpdate: false, isDelete: false, isRead: false },
    tasks: { isCreate: false, isUpdate: false, isDelete: false, isRead: false },
    eventActions: { isRead: false },
    finance: {
        payments: { isRead: false },
        costs: { isCreate: false, isUpdate: false, isDelete: false, isRead: false },
        coursePayments: { isCreate: false, isUpdate: false, isDelete: false, isRead: false },
        groupPayments: { isCreate: false, isUpdate: false, isDelete: false, isRead: false }
    },
    settings: {
        forms: { isCreate: false, isUpdate: false, isDelete: false, isRead: false },
        company: { isCreate: false, isUpdate: false, isDelete: false, isRead: false },
        user: { isCreate: false, isUpdate: false, isDelete: false, isRead: false },
        payments: { isRead: false, isCreate: false }
    }
}