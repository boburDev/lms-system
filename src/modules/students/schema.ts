import { gql } from 'apollo-server-express'

export default gql`
type Query {
  students: [Student!]!
}

type Mutation {
  addStudent(input: AddStudentInput): Student!
}

input ParentInput {
  parentName: String!
  parentPhone: String!
}

input AddStudentInput {
  studentName: String!
  studentPhone: String!
  studentPassword: String
  studentStatus: Int!
  studentBalance: Float!
  colleagueId: String
  parentsInfo: [ParentInput]
}

type Parent {
  parentName: String!
  parentPhone: String!
}


type Student {
    studentId: ID!
    studentName: String!
    studentPhone: String!
    studentStatus: Int!
    studentBalance: Float!
    colleagueId: String
    parentsInfo: [Parent]
}
`
