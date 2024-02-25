import { gql } from 'apollo-server-express'

export default gql`
type Query {
  countries: [Country]
}

type Mutation {
  addCountry(input: AddCountryInput!): Country!
}

type Country {
  countryId: ID!
  countryName: String!
}

input AddCountryInput {
  countryName: String!
}`
