import { gql } from 'apollo-server-express';

export default gql`
    type Query {
        groupAttendenceByIdOrDate(Id: String! month: String!): GroupAttendence
    }

    type Mutation {
        updateStudentAttendanceStatus(input: updateStudentAttendenceStatus!): String!
        updateGroupAttendanceStatus(input: updateGroupAttendanceStatus!): String!
    }

    type Subscription {
        updateStudentAttendance: StudentAttendence!
        updateGroupAttendance: GroupAttendence!
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

    type StudentAttendence {
        attendId: ID!
        attendDay: String!
        attendStatus: Int!
        groupId: ID!
        studentId: ID!
    }

    input updateStudentAttendenceStatus {
        attendId: ID!
        groupId: ID!
        attendStatus: Int!
        studentId: ID!
    }

    input updateGroupAttendanceStatus {
        attendId: ID!
        groupId: ID!
        attendStatus: Int!
    }
`;
