import { gql } from 'apollo-server-express'

export default gql`
type Query {
  costs: [Cost]!
}

type Mutation {
  addCost(input: AddCostInput) : Cost!
}

type Cost {
	costId: String!
  costName: Int!
  costType: String!
  costPrice: Int!
  costSelectedDate: String!
  costCreated: String!
}

input AddCostInput {
  costName: String!
  costType: String!
  costPrice: Int!
  costSelectedDate: String!
}
`
