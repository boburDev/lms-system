import { RolePermissions } from "../interfaces/role_permissions";

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

export const positionStudent = (status:number) => {
    if (status == 1) return 'Markaz ro\'yxatida mavjud'
    if (status == 1) return 'Markaz ro\'yxatida mavjud'
    if (status == 2) return 'Guruhga sinov darsi uchun qo\'shildi'
    if (status == 3) return 'Guruhda o\'qish uchun pul to\'lagan'
    if (status == 4) return 'Qarzdor o\'quvchi'
    if (status == 5) return 'Muzlatilgan o\'quvchi'
    if (status == 6) return 'Darsga kelishni to\'xtatgan o\'quvchi'
    if (status == 7) return 'Sinov darsidan so\'ng ketganlar'
    if (status == 7) return 'Sinov darsidan so\'ng ketganlar'
}

export const getPermissions = (role: string, permissions: RolePermissions) => {
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
        // Add other roles here with their respective permissions
        default:
            return {};
    }
}
