import { gql } from 'apollo-server-express'

export default gql`
type Query {
    funnels: [Funnel!]!
    funnelById(Id: String): Funnel!
}

type Mutation {
    addFunnel (input: AddFunnelInput!): Funnel!
    updateFunnel (input: AddFunnelInput!): Funnel!
    deleteFunnel (Id: String): Funnel!
}

type Subscription {
    createFunnel: Funnel!
    updateFunnel: Funnel!
    deleteFunnel: Funnel!
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