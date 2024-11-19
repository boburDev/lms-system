import { gql } from 'apollo-server-express'

export default gql`
type Query {
  students(page: Int! count: Int!): [Student!]!
  studentCount: Int!
  studentById(Id: String): Student
}

type Mutation {
  addStudent(input: AddStudentInput): Student!
  updateStudent(input: UpdateStudentInput): Student!
  deleteStudent(studentId: String): Student!
}

type Subscription {
  createStudent: Student!
  updateStudent: Student!
  deleteStudent: Student!
}


input ParentInput {
  parentName: String!
  parentPhone: String!
}

input AddStudentInput {
  studentName: String!
  studentPhone: String!
  studentStatus: Int
  studentBithday: String
  studentGender: Int
  groupId: String
  addedDate: String
  parentsInfo: [ParentInput]
}

input UpdateStudentInput {
  studentId: String
  studentName: String
  studentPhone: String
  studentBithday: String
  studentGender: Int
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
