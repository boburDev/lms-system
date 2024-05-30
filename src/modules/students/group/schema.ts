import { gql } from 'apollo-server-express'

export default gql`
    type Mutation {
        addStudentGroup(input: AddStudentGroupInput): String
    }

    input AddStudentGroupInput {
        studentId: ID!
        groupId: ID!
        addedDate: String!
    }
`