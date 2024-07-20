import { gql } from 'apollo-server-express'

export default gql`
type Query {
  companies(input: SearchCompanyInput): [Company]
}

type Mutation {
  addCompanyBranch(input: AddCompanyBranchInput!): addedCompany
}

type Company {
  companyId: String
  companyName: String
  branches: [Branch]
}

type Branch {
  branchId: String
  branchName: String
  branchPhone: String
  branchStatus: Boolean
  branchBalance: String
  branchSubdomen: String
  companyId: String
  companyName: String
  countryId: String
  countryName: String
  regionId: String
  regionName: String
  districtId: String
  districtName: String
}

type addedCompany {
  token: String
  redirect_link: String
  role: String
}

input SearchCompanyInput {
  countryId: String
  regionId: String
  districtId: String
}

input AddCompanyBranchInput {
  companyId: String
  branchName: String
  branchPhone: String
  derectorName: String
  derectorPhone: String
  password: String
  districtId: String
}
`
