import { gql } from 'apollo-server-express'

export default gql`
type Query {
  groupDiscounts(groupId: String!): [GroupDiscount]
}

type Mutation {
  addGroupDiscount(input: AddGroupDiscountInput!): GroupDiscount!
}
  
type GroupDiscount {
  studentId: String!
  groupId: String!
  discountAmount: Float!
}

input AddGroupDiscountInput {
  studentId: String!
  groupId: String!
  discountAmount: Float!
  discountStartDate: String
  discountEndDate: String
}
`