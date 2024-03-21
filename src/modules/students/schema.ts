import { gql } from 'apollo-server-express'

export default gql`
type Query {
  students
}

type Mutation {
  
}

type Student {
    studentId: ID!
    studentName: String!
    branchId: ID!
}

input somename {
  
}`
