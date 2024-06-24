import { gql } from 'apollo-server-express'

export default gql`
    type Query {
        groupAttendenceByIdOrDate(Id: String startDate: String endDate: String): GroupAttendence
    }

    type Mutation {
        updateStudentAttendanceStatus(input: updateStudentAttendenceStatus!): String!
        updateGroupAttendanceStatus(input: updateGroupAttendenceStatus!): String!
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

    input updateStudentAttendenceStatus {
        attendId: ID!
        groupId: ID!
        attendStatus: Int!
        studentId: ID!
    }
    input updateGroupAttendenceStatus {
        attendId: ID!
        groupId: ID!
        attendStatus: Int!
    }
`