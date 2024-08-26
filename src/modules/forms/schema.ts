import { gql } from 'apollo-server-express'

export default gql`
type Query {
  forms: [Form]!
  formById(Id: String!): Form!
}

type Mutation {
  addForm(input: AddFormInput) : Form!
}

type Form {
  formId: String!
  formTitle: String!
}

input AddFormInput {
  formTitle: String!
  formType: String!
  Funnels: [String!]
}

input UpdateFormInput {
  formId: String!
  formTitle: String
}
`