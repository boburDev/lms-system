import { makeExecutableSchema } from '@graphql-tools/schema'

import Countries from './countries'
import Regions from './regions'
import Companies from './companies'

export default makeExecutableSchema({
    typeDefs: [
        Countries.schema,
        Regions.schema,
        Companies.schema
    ],
    resolvers: [
        Countries.resolvers,
        Regions.resolvers,
        Companies.resolvers
    ]
})