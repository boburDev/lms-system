import { gql } from 'apollo-server-express'

export default gql`
type Query {
  groups: [Group]
}

type Mutation {
  addGroup(input: AddGroupInput!): Group!
}

type Group {
  groupId: ID!
  groupName: String!
  courseId: ID!
  courseName: ID!
  employerId: ID!
  employerName: ID!
  roomId: ID!
  roomName: ID!
  startDate: String!
  endDate: String!
  startTime: String!
  endTime: String!
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
`
