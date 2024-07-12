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
  studentName: String!
  studentPhone: String!
  groupId: String!
  discountAmount: Float!
  discountType: Int!
  discountStartDate: String
  discountEndDate: String
}

input AddGroupDiscountInput {
  studentId: String!
  groupId: String!
  discountAmount: Float!
  discountType: Int!
  discountStartDate: String
  discountEndDate: String
}
`