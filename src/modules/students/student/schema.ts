import { gql } from 'apollo-server-express'

export default gql`
type Query {
  students(page: Int! count: Int!): [Student!]!
  studentCount: Int!
  studentById(Id: String): Student
}

type Mutation {
  addStudent(input: AddStudentInput): Student!
  deleteStudent(studentId: String): Student!
}

input ParentInput {
  parentName: String!
  parentPhone: String!
}

input AddStudentInput {
  studentName: String!
  studentPhone: String!
  studentPassword: String
  studentStatus: Int
  studentBithday: String
  studentGender: Int
  studentCash: Float
  studentCashType: Int
  colleagueId: String
  groupId: String
  addedDate: String
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
    studentBithday: String
    studentGender: Int
    parentsInfo: [Parent]
    studentGroup: [StudentGroups]
    
}

type StudentGroups {
  groupId: String
  groupName: String
  colleagueName: String
  lessonStartTime: String
}
`
// studentGroups(studentId: String): [Group]!
