type AddCostInput = {
    costName: string
    costPrice: number
    costPayed: string
    costColleagueId: string
    costBranchId: string
}

type Cost = {
    room_id: string,
    room_name: string
}

export {
    Cost,
    AddCostInput
}