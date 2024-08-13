import { gql } from 'apollo-server-express'

export default gql`
type Query {
  costs(startDate: String endDate: String): CostSum!
  costById(Id: String): Cost!
}

type Mutation {
  addCost(input: AddCostInput) : Cost!
  updateCost(input: UpdateCostInput) : Cost!
  deleteCost(Id: String) : Cost!
}

type CostSum {
  Costs: [Cost]
  Sum: Int
}

type Cost {
	costId: String!
  costName: String!
  costType: String!
  costPrice: Int!
  costPayedAt: String!
  costCreated: String!
}

input AddCostInput {
  costName: String!
  costType: String!
  costPrice: Int!
  costColleagueId: String!
  costPayedAt: String!
}

input UpdateCostInput {
  costId: String!
  costName: String
  costType: String
  costPrice: Int
  costPayedAt: String
  costColleagueId: String
}
`
