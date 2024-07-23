export interface Permission {
    isCreate?: boolean;
    isUpdate?: boolean;
    isDelete?: boolean;
    isRead?: boolean;
    isExport?: boolean;
    isImport?: boolean;
    isRecover?: boolean;
    isAll?: boolean;
}

export interface RolePermissions {
    [key: string]: {
        [key: string]: Permission | {
            [key: string]: Permission;
        };
    };
}