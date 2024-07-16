import { gql } from 'apollo-server-express'

export default gql`
    type Mutation {
        addStudentGroup(input: AddStudentGroupInput): String
        updateStudentAddedGroupDate(input: UpdateStudentAddedGroupDateInput): String
        changeStudentGroup(input: ChangeStudentGroupDateInput): String
        deleteStudentGroup(input: DeleteStudentGroupInput): String
    }

    input AddStudentGroupInput {
        studentId: ID!
        groupId: ID!
        addedDate: String!
    }

    input DeleteStudentGroupInput {
        studentId: ID!
        groupId: ID!
    }

    input UpdateStudentAddedGroupDateInput {
        studentId: ID!
        groupId: ID!
        addedDate: String!
    }

    input ChangeStudentGroupDateInput {
        studentId: ID!
        fromGroupId: ID!
        toGroupId: ID!
        fromToday: Boolean
        addedDate: String!
    }
`