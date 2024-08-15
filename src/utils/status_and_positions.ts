export default function positionIndicator(position: string | number): string | number | null {
    const positionMap: { [key: string]: number } = {
        ceo: 1,
        director: 2,
        administrator: 3,
        teacher: 4,
        marketolog: 5,
        casher: 6
    };

    const valueMap: { [key: number]: string } = Object.fromEntries(
        Object.entries(positionMap).map(([key, value]) => [value, key])
    );

    if (typeof position === 'string') {
        return positionMap[position] || null;
    } else if (typeof position === 'number') {
        return valueMap[position] || null;
    }

    return null;
}

export function costTypes(position: string | number): string | number | null {
    const positionMap: { [key: string]: number } = {
        marketing: 1,
        arenda: 2,
        oyliklar: 3,
        jihozlar: 4,
        others: 5
    };

    const valueMap: { [key: number]: string } = Object.fromEntries(
        Object.entries(positionMap).map(([key, value]) => [value, key])
    );

    if (typeof position === 'string') {
        return positionMap[position] || 5;
    } else if (typeof position === 'number') {
        return valueMap[position] || 'others';
    }
    return null;
}

export function paymentTypes(position: string | number): string | number | null {
    const positionMap: { [key: string]: number } = {
        cash: 1,
        card: 2,
        bankaccount: 3
    };

    const valueMap: { [key: number]: string } = Object.fromEntries(
        Object.entries(positionMap).map(([key, value]) => [value, key])
    );

    if (typeof position === 'string') {
        return positionMap[position] || null;
    } else if (typeof position === 'number') {
        return valueMap[position] || null;
    }
    return null;
}

export const positionStudent = (status:number) => {
    if (status == 1) return 'Markaz ro\'yxatida mavjud'
    if (status == 2) return 'Active student'
    if (status == 3) return 'Qarzdor o\'quvchi'
    if (status == 4) return 'Guruhga sinov darsi uchun qo\'shildi'
    if (status == 5) return 'Dars qoldirgan student'
    if (status == 6) return 'Darsga kelishni to\'xtatgan o\'quvchi'
    if (status == 7) return 'Sinov darsidan so\'ng ketganlar'
    // if (status == 5) return 'Muzlatilgan o\'quvchi'
}

export const getPermissions = (role: string, permissions: any) => {
    switch (role) {
        case 'teacher':
            return {
                "calendar": permissions.calendar,
                "students": {
                    "students": permissions.students.students,
                    "groups": permissions.students.groups
                },
                "groups": {
                    "groups": permissions.groups.groups,
                    "attendance": permissions.groups.attendance
                },
                "tasks": permissions.tasks,
                "settings": {
                    "user": permissions.settings.user
                }
            };
        case 'marketolog':
            return {
                "dashboard": {
                    "colleaue_stat": permissions.dashboard.colleaue_stat,
                    "client_stat": permissions.dashboard.client_stat
                },
                "calendar": permissions.calendar,
                "tasks": permissions.tasks,
                "settings": {
                    "user": permissions.settings.user
                }
            };
        case 'casher':
            return {
                "dashboard": {
                    "students_stat": permissions.dashboard.students_stat,
                    "colleaue_stat": permissions.dashboard.colleaue_stat,
                    "client_stat": permissions.dashboard.client_stat
                },
                "calendar": permissions.calendar,
                "tasks": permissions.tasks,
                "finance": permissions.finance,
                "settings": {
                    "user": permissions.settings.user
                }
            };  
        case 'administrator':
            return {
                "dashboard": permissions.dashboard,
                "leads": permissions.leads,
                "calendar": permissions.calendar,
                "students": permissions.students,
                "groups": permissions.groups,
                "tasks": permissions.tasks,
                "courses": permissions.courses,
                "rooms": permissions.rooms,
                "employers": permissions.employers,
                "finance": {
                    "costs": permissions.costs,
                },
                "settings": {
                    "user": permissions.settings.user
                }
            };
        case 'director':
            return {
                "dashboard": permissions.dashboard,
                "leads": permissions.leads,
                "calendar": permissions.calendar,
                "employers": permissions.employers,
                "students": permissions.students,
                "groups": permissions.groups,
                "courses": permissions.courses,
                "rooms": permissions.rooms,
                "tasks": permissions.tasks,
                "finance": permissions.finance,
                "settings": {
                    "forms": permissions.settings.forms,
                    "company": permissions.settings.company,
                    "payments": permissions.settings.payments,
                    "user": permissions.settings.user
                }
            };
        default:
            return { error: true, message: 'Role not found'};
    }
}
