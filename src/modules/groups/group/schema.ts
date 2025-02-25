import { gql } from 'apollo-server-express'

export default gql`
type Query {
  groups(page: Int! count: Int! isArchive: Boolean!): [Group]
  groupCount(isArchive: Boolean!): Int!
  groupByIdOrDate(Id: String startDate: String endDate: String): GroupById
}

type Mutation {
  addGroup(input: AddGroupInput!): Group!
  updateGroup(input: UpdateGroupInput!): Group!
  deleteGroup(Id: String): Group!
}

type Group {
  groupId: ID!
  groupName: String!
  courseId: ID!
  courseName: ID
  employerId: ID!
  employerName: ID
  roomId: ID!
  roomName: ID
  startDate: String!
  endDate: String!
  startTime: String!
  endTime: String!
  studentCount: Int!
  groupDays: [String]
}

type GroupById {
  groupId: ID!
  groupName: String!
  courseId: ID!
  courseName: ID
  employerId: ID!
  employerName: ID
  roomId: ID!
  roomName: ID
  startDate: String!
  endDate: String!
  startTime: String!
  endTime: String!
  groupDays: [String]
  students: [studentGroupInfo]
}

type studentGroupInfo {
  studentId: ID!
  studentName: String!
  studentStatus: Int!
  studentBalance: Float!
  studentAddDate: String!
}

input AddGroupInput {
  groupName: String!
  courseId: ID!
  employerId: ID!
  roomId: ID!
  startDate: String!
  endDate: String!
  startTime: String!
  endTime: String!
  lessonCount: Int!
  groupDays: [Int]
}

input UpdateGroupInput {
  groupId: ID!
  groupName: String
  courseId: ID
  employerId: ID
  roomId: ID
  startDate: String
  endDate: String
  startTime: String
  endTime: String
  lessonCount: Int
  groupDays: [Int]
}
`
