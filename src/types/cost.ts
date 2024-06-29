type AddCostInput = {
    costName: string
    costPrice: number
    costPayed: string
    costColleagueId: string
    costBranchId: string
}

type Cost = {
    cost_id: string,
    cost_name: string
    cost_amount: number
    cost_payed_at: string
}

export {
    Cost,
    AddCostInput
}