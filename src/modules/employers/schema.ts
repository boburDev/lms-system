import { gql } from 'apollo-server-express'

export default gql`
type Query {
  employers(employerId: ID): [Employer!]!
  employerRoles: [String]
  employerPermissions(employerRole: String): String
}

type Mutation {
  addEmployer(input: AddEmployerInput): Employer!
  updateEmployer(input: AddEmployerInput): Employer!
  updateEmployerProfile(input: UpdateEmployerProfileInput): Employer!
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
}

input UpdateEmployerInput {
  employerId: String!
  employerName: String!
  employerPhone: String!
  employerPosition: String!
  employerPassword: String!
}

input UpdateEmployerProfileInput {
  employerId: String!
  employerName: String
  employerPhone: String
  employerBirthday: String
  employerGender: Int
  employerLang: String
}
`
