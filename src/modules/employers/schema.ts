import { gql } from 'apollo-server-express'

export default gql`
type Query {
  employers: [Employer!]!
  employerById(employerId: ID!): Employer!
  employerRoles: [String]
  employerPermissions(employerRole: String): String
}

type Mutation {
  addEmployer(input: AddEmployerInput): Employer!
  updateEmployer(input: UpdateEmployerInput): Employer!
  updateEmployerProfile(input: UpdateEmployerProfileInput): Employer!
  deactivateEmployer(employerId: String!): Employer!
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
  employerPermission: String
  employerBranchId: String!
}

input AddEmployerInput {
  employerName: String!
  employerPhone: String!
  employerGender: String
  employerBirthday: String
  employerPosition: String!
  employerPassword: String!
  employerPermission: String!
}

input UpdateEmployerInput {
  employerId: String!
  employerName: String
  employerPhone: String
  employerGender: String
  employerBirthday: String
  employerPosition: String
  employerPassword: String
  employerPermission: String
}

input UpdateEmployerInput {
  employerId: String!
  employerName: String
  employerPhone: String
  employerPosition: String
  employerPassword: String
  employerGender: String
  employerBirthday: String
  employerPermission: String
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
