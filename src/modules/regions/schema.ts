import { gql } from 'apollo-server-express'

export default gql`
type Query {
  regions(countryId: ID): [Region!]!
  regionById(Id: String): Region!
  districts(regionId: ID): [District!]!
  districtById(Id: String): District
}

type Mutation {
  addRegion(input: AddRegionInput!): Region!
  updateRegion(input: UpdateRegionInput!): Region!
  addDistrict(input: AddDistrictInput!): District!
  updateDistrict(input: UpdateDistrictInput!): District!
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

input UpdateRegionInput {
  regionId: ID!
  regionName: String!
  countryId: ID!
}

input UpdateDistrictInput {
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
}
`
