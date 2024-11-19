import { gql } from 'apollo-server-express'

export default gql`
type Query {
    funnelColumns(funnelId: ID!): [FunnelColumn!]!
    funnelColumnById(funnelColumnId: String!): FunnelColumn!
}

type Mutation {
    addFunnelColumn (input: AddFunnelColumnInput!): FunnelColumn!
    updateFunnelColumn (input: UpdateFunnelColumnInput!): FunnelColumn!
    deleteFunnelColumn (Id: String!): FunnelColumn!
}

type Subscription {
    createFunnelColumn: FunnelColumn!
    updateFunnelColumn: FunnelColumn!
    deleteFunnelColumn: FunnelColumn!
}

input AddFunnelColumnInput {
    funnelColumnName: String!
    funnelColumnColor: String!
    funnelId: ID!
}

input UpdateFunnelColumnInput {
    funnelColumnId: String!
    funnelColumnName: String
    funnelColumnOrder: Int
    funnelColumnColor: String
    funnelId: ID
}

type FunnelColumn {
    funnelColumnId: ID!
    funnelColumnName: String!
    funnelColumnColor: String!
    funnelColumnOrder: Int!
    funnelId: ID!
}
`