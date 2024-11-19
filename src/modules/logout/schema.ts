import { gql } from 'apollo-server-express'

export default gql`
type Mutation {
  logout(colleagueId: String!): ResponseMessage!
}

type ResponseMessage {
  message: String!
}
`