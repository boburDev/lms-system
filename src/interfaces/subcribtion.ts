interface ConnectionContext {
    authorization: string;
    isUser: boolean;
    connectId?: string;
    colleagueId?: string;
    date?: number;
    branchId?: string;
}
export {
    ConnectionContext
}