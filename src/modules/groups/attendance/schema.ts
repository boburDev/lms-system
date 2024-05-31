import { gql } from 'apollo-server-express'

export default gql`
    type Query {
        groupAttendenceByIdOrDate(Id: String startDate: String endDate: String): GroupAttendence
    }

    type GroupAttendence {
        groupAttendence: [Attendence]
        studentsAttendence: [studentsAttendenceData]
    }

    type studentsAttendenceData {
        studentId: ID
        studentName: String
        attendence: [Attendence]
    }
    type Attendence {
        attendId: ID!
        attendDay: String!
        attendStatus: Int!
        groupId: ID!
    }
`