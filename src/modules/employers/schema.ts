import { gql } from 'apollo-server-express'

export default gql`
type Query {
  employers(employerId: ID): [Employer!]!
  employerPermissions(employerRole: String): String
}

type Mutation {
  addEmployer(input: AddEmployerInput): Employer!
  deleteEmployer(employerId: String!): Employer!
}

type Employer {
  employerId: ID!
  employerName: String!
  employerPhone: String!
  employerBirthday: String
  employerGender: String
  employerPosition: String!
  employerUseLang: String
  employerCreatedAt: String!
  employerDeletedAt: String
  employerBranchId: String!
}

input AddEmployerInput {
  employerName: String!
  employerPhone: String!
  employerPosition: String!
  employerPassword: String!
}`
