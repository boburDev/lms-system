import { gql } from 'apollo-server-express'


export default gql`
type Query {
  hello: String
}

type Mutation {
  addUser(input: AddUserInput!): User!
}

type User {
  id: ID!
  name: String!
  email: String!
  role: String!
}

input AddUserInput {
  name: String!
  email: String!
  role: String!
}
`