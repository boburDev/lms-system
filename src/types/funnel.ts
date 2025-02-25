type AddFunnelInput = {
    funnelId: string
    funnelName: string
}

type Funnel = {
    funnel_id: string
    funnel_name: string
}

type AddFunnelColumnInput = {
    funnelId: string
    funnelColumnName: string
    funnelColumnColor: string
}

type UpdateFunnelColumnInput = {
    funnelId: string
    funnelColumnId: string
    funnelColumnName: string
    funnelColumnColor: string
    funnelColumnOrder: number
}

type FunnelColumn = {
    funnel_column_id: string
    funnel_column_name: string
    funnel_column_color: string
    funnel_column_order: string
    funnel_id: string
}

export {
    Funnel,
    AddFunnelInput,
    AddFunnelColumnInput,
    UpdateFunnelColumnInput,
    FunnelColumn
}