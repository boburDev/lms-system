import { gql } from 'apollo-server-express'

export default gql`
type Query {
  costs: [Cost]!
  costById(Id: String): Cost!
}

type Mutation {
  addCost(input: AddCostInput) : Cost!
  updateCost(input: UpdateCostInput) : Cost!
}

type Cost {
	costId: String!
  costName: String!
  costType: Int!
  costPrice: Int!
  costSelectedDate: String!
  costCreated: String!
}

input AddCostInput {
  costName: String!
  costType: Int!
  costPrice: Int!
  costColleagueId: String!
  costSelectedDate: String!
}

input UpdateCostInput {
  costId: String!
  costName: String
  costType: Int
  costPrice: Int
  costSelectedDate: String
  costColleagueId: String
}
`
