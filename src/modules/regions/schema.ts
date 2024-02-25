import { gql } from 'apollo-server-express'

export default gql`
type Query {
  regions(countryId: ID): [Region!]!
}

type Mutation {
  addRegion(input: AddRegionInput!): Region!
}

type Region {
  regionId: ID!
  regionName: String!
  countryId: ID!
}

input AddRegionInput {
  regionName: String!
  countryId: ID!
}`
