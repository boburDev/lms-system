import { gql } from 'apollo-server-express'

export default gql`
    type Mutation {
        activateStudentGroup(input: ActivateStudentGroupInput): String
        addStudentGroup(input: AddStudentGroupInput): String
        freezeStudentGroup(input: FreezeStudentGroupInput): String
        updateStudentAddedGroupDate(input: UpdateStudentAddedGroupDateInput): String
        changeStudentGroup(input: ChangeStudentGroupDateInput): String
        deleteStudentGroup(input: DeleteStudentGroupInput): String
    }

    type Subscription {
        studentGroupCreated: StudentGroup
        studentGroupUpdated: StudentGroup
        studentGroupDeleted: StudentGroup
    }

    type StudentGroup {
        studentId: ID
        groupId: ID
        studentGroupStatus: Int
        addedDate: String
    }


    input AddStudentGroupInput {
        studentId: ID
        groupId: ID!
        addedDate: String!
    }
    
    input ActivateStudentGroupInput {
        studentId: ID!
        groupId: ID!
    }

    input FreezeStudentGroupInput {
        studentId: ID!
        groupId: ID!
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