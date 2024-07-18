type SearchCompanyInput = {
    countryId: string
    regionId: string
    districtId: string
}

type AddCompanyBranchInput = {
    companyId: string
    branchName: string
    branchPhone: string
    derectorName: string
    derectorPhone: string
    password: string
    districtId: string
}

type CompanyBranch = {
    company_id: string
    company_name: string
    companyBranches: [{
        company_branch_id: string
        company_branch_name: string
        company_branch_phone: string
        company_branch_status: boolean
        company_branch_balance: string
        company_branch_subdomen: string
        companies: {
            company_id: string
            company_name: string
        }
        districts: {
            district_id: string
            district_name: string
            regions: {
                region_id: string
                region_name: string
                countries: {
                    country_id: string
                    country_name: string
                }
            }
        }
    }]
}

export {
    SearchCompanyInput,
    AddCompanyBranchInput,
    CompanyBranch
}