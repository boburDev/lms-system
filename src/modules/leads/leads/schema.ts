import { gql } from 'apollo-server-express'

export default gql`
type Query {
    leads(funnelId: ID!): Leads
    leadById(Id: String!): Lead
}

 type Mutation {
    addLead(input: AddLeadInput): Lead!
    updateLead(input: UpdateLeadInput): Lead!
    updateLeadColumn(input: UpdateLeadColumnInput): Lead!
    dateteLead(leadId: String): Lead!
}

input AddLeadInput {
    leadName: String!
    leadPhone: String!
    columnId: ID!
    courseId: ID
}

input UpdateLeadInput {
    leadId: String!
    leadName: String
    leadPhone: String
    courseId: ID
}

input UpdateLeadColumnInput {
    leadId: String!
    columnId: ID!
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