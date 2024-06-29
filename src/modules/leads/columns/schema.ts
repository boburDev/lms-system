import { gql } from 'apollo-server-express'

export default gql`
type Query {
    funnelColumns(funnelId: ID!): [FunnelColumn!]!
}

type Mutation {
    addFunnelColumn (input: AddFunnelColumnInput!): FunnelColumn!
}

input AddFunnelColumnInput {
    funnelId: ID!
    funnelColumnName: String!
    funnelColumnColor: String!
}

type FunnelColumn {
    funnelColumnId: ID!
    funnelColumnName: String!
    funnelColumnColor: String!
    funnelColumnOrder: Int!
    funnelId: ID!
}
`