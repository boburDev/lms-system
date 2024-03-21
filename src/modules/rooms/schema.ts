import { gql } from 'apollo-server-express'

export default gql`
type Query {
  rooms: [Room]!
}

type Mutation {
  addRoom(input: AddRoomInput) : Room!
}

type Room {
	roomId: String!
  roomName: String!
}

input AddRoomInput {
  roomName: String!
}
`
