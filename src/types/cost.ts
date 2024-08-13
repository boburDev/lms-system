type AddCostInput = {
    costName: string
    costPrice: number
    costType: string
    costPayedAt: string
    costColleagueId: string
}

type UpdateCostInput = {
    costId: string
    costName: string
    costPrice: number
    costType: string
    costPayedAt: string
    costColleagueId: string
}

type Cost = {
    cost_id: string,
    cost_name: string
    cost_amount: number
    cost_payed_at: string
    cost_type: string
    cost_created: string
}

export {
    Cost,
    AddCostInput,
    UpdateCostInput
}
