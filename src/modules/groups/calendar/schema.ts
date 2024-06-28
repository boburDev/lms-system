import { gql } from 'apollo-server-express'

export default gql`
type Query {
    findCalendar(startDate: String! endDate: String!): [Calendar]!
}
type Calendar {
    date: String
    groups: [Group]
}
`