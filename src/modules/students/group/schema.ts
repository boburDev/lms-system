import { gql } from 'apollo-server-express'

export default gql`
    type Mutation {
        addStudentGroup(input: AddStudentGroupInput): String
        updateStudentAddedGroupDate(input: UpdateStudentAddedGroupDateInput): String
    }

    input AddStudentGroupInput {
        studentId: ID!
        groupId: ID!
        addedDate: String!
    }

    input UpdateStudentAddedGroupDateInput {
        studentId: ID!
        groupId: ID!
        addedDate: String!
    }
`