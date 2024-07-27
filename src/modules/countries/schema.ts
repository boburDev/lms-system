import { gql } from 'apollo-server-express'

export default gql`
type Query {
  countries: [Country]!
  countryById(Id: String): Country!
}

type Mutation {
  addCountry(input: AddCountryInput!): Country!
  updateCountry(input: UpdateCountryInput!): Country!
}

type Country {
  countryId: ID!
  countryName: String!
}

input AddCountryInput {
  countryName: String!
}

input UpdateCountryInput {
  countryId: String!
  countryName: String!
}
`
