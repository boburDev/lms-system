type AddRegionInput = {
    regionName: string,
    countryId: string
}

type Region = {
    region_id: string,
    region_name: string,
    country_id: string
}

export {
    Region,
    AddRegionInput
}
