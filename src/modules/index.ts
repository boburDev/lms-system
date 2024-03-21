import { makeExecutableSchema } from '@graphql-tools/schema'

import Countries from './countries'
import Regions from './regions'
import Employers from './employers'
import Rooms from './rooms'


export default makeExecutableSchema({
    typeDefs: [
        Countries.schema,
        Regions.schema,
        Employers.schema,
        Rooms.schema,
    ],
    resolvers: [
        Countries.resolvers,
        Regions.resolvers,
        Employers.resolvers,
        Rooms.resolvers,
    ]
})