import { gql } from 'apollo-server-express'

export default gql`
type Query {
    funnels: [Funnel!]!
}

type Mutation {
    addFunnel (input: AddFunnelInput!): Funnel!
}

input AddFunnelInput {
    funnelId: ID
    funnelName: String!
}

type Funnel {
    funnelId: ID!
    funnelName: String!
}
`