import { gql } from 'apollo-server-express'

export default gql`
type Query {
  companies: [Company]
}

type Mutation {
  addCompany(input: AddCompanyInput!): Company!
}

type Company {
  name: String
}

input AddCompanyInput {
  companyName: String
  companyPhone: String
  derectorName: String
  derectorPhone: String
  regionId: String
  password: String
}`
