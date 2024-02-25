import { makeExecutableSchema } from '@graphql-tools/schema'

import Countries from './countries'
import Regions from './regions'

export default makeExecutableSchema({
    typeDefs: [
        Countries.schema,
        Regions.schema,
    ],
    resolvers: [
        Countries.resolvers,
        Regions.resolvers,
    ]
})