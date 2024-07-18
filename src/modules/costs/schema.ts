import { gql } from 'apollo-server-express'

export default gql`
type Query {
  costs: [Cost]!
}

type Mutation {
  addCost(input: AddCostInput) : Cost!
  updateCost(input: UpdateCostInput) : Cost!
}

type Cost {
	costId: String!
  costName: String!
  costType: String!
  costPrice: Int!
  costSelectedDate: String!
  costCreated: String!
}

input AddCostInput {
  costName: String!
  costType: Int!
  costPrice: Int!
  costColleagueId: Int!
  costSelectedDate: String!
}

input UpdateCostInput {
  costId: String!
  costName: String!
  costType: String!
  costPrice: Int!
  costSelectedDate: String!
}
`
