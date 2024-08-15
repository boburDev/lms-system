import { gql } from 'apollo-server-express'

export default gql`
type Query {
  studentsStatistics(startDate: String endDate: String): [StudentInfo]!
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
`