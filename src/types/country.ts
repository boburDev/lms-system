type AddCountryInput = {
    countryName: string
}

type UpdateCountryInput = {
    countryId: string
    countryName: string
}

type Country = {
    country_id: string,
    country_name: string
}

export {
    Country,
    AddCountryInput,
    UpdateCountryInput
}
