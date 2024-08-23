import { gql } from 'apollo-server-express'

export default gql`
type Query {
  studentsStatistics(startDate: String endDate: String): StudentInfo!
  employersStatistics(startDate: String endDate: String, employerId: String): [EmployerAppUsage]!
  groupsStatistics(startDate: String endDate: String): [EmployerAppUsage]!
}

type StudentInfo {
  allStudents: Int!
  activeStudents: Int!
  notPayedStudents: Int!
  trialStudents: Int!
  missedStudents: Int!
  leftStudents: Int!
  leftTrialStudents: Int!
  leads: Int!
}

type EmployerAppUsage {
  employerId: ID!
  employerName: String!
  appUsageTime: String!
}
`