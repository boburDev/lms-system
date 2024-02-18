import { makeExecutableSchema } from '@graphql-tools/schema'

import User from './users'

export default makeExecutableSchema({
    typeDefs: [User.schema],
    resolvers: [User.resolvers]
})