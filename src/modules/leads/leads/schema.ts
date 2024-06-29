import { gql } from 'apollo-server-express'

export default gql`
type Query {
    leads(funnelId: ID!): Leads
}

 type Mutation {
    addLead(input: AddLeadInput): Lead!
}

input AddLeadInput {
    leadName: String!
    leadPhone: String!
    columnId: ID!
    courseId: ID
}

type Lead {
    leadId: ID!
    leadName: String!
    leadPhone: String!
    leadStatus: Int!
    columnId: ID!
    courseId: ID
    courseName: String
    colleagueId: ID
    colleagueName: String
}

type Leads {
    leadList: [Lead]
    funnelColumnList: [FunnelColumn]
}
`