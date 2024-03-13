import { gql } from 'apollo-server-express'

export default gql`
type Query {
  regions(countryId: ID): [Region!]!
  districts(regionId: ID): [District!]!
}

type Mutation {
  addRegion(input: AddRegionInput!): Region!
  addDistrict(input: AddDistrictInput!): District!
}

type Region {
  regionId: ID!
  regionName: String!
  countryId: ID!
}

type District {
  districtId: ID!
  districtName: String!
  regionId: ID!
}

input AddRegionInput {
  regionName: String!
  countryId: ID!
}

input AddDistrictInput {
  districtName: String!
  regionId: ID!
}`
