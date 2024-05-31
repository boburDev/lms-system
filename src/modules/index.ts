import { makeExecutableSchema } from '@graphql-tools/schema'

import Countries from './countries'
import Regions from './regions'
import Employers from './employers'
import Rooms from './rooms'
import Courses from './courses'
import Students from './students/student'
import StudentsGroup from './students/group'
import Groups from './groups/group'
import GroupAttendance from './groups/attendance'

export default makeExecutableSchema({
    typeDefs: [
        Countries.schema,
        Regions.schema,
        Employers.schema,
        Rooms.schema,
        Courses.schema,
        Students.schema,
        StudentsGroup.schema,
        Groups.schema,
        GroupAttendance.schema,
    ],
    resolvers: [
        Countries.resolvers,
        Regions.resolvers,
        Employers.resolvers,
        Rooms.resolvers,
        Courses.resolvers,
        Students.resolvers,
        StudentsGroup.resolvers,
        Groups.resolvers,
        GroupAttendance.resolvers,
    ]
})