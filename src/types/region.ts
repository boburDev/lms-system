type AddRegionInput = {
    regionName: string,
    countryId: string
}

type AddDistrictInput = {
    districtName: string,
    regionId: string
}

type UpdateRegionInput = {
    regionId: string,
    regionName: string,
    countryId: string
}

type UpdateDistrictInput = {
    districtId: string,
    districtName: string,
    regionId: string
}

type Region = {
    region_id: string,
    region_name: string,
    country_id: string
}

type District = {
    district_id: string,
    district_name: string,
    region_id: string
}

export {
    Region,
    District,
    AddRegionInput,
    AddDistrictInput,
    UpdateRegionInput,
    UpdateDistrictInput
}
