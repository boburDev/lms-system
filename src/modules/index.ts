import { makeExecutableSchema } from '@graphql-tools/schema'

import Countries from './countries'
import Regions from './regions'
import Employers from './employers'
import Rooms from './rooms'
import Courses from './courses'
import Students from './students/student'
import StudentsCash from './students/payment'
import StudentsGroup from './students/group'
import Groups from './groups/group'
import GroupAttendance from './groups/attendance'
import Tasks from './tasks'
import Calendar from './groups/calendar'

export default makeExecutableSchema({
    typeDefs: [
        Countries.schema,
        Regions.schema,
        Employers.schema,
        Rooms.schema,
        Courses.schema,
        Students.schema,
        StudentsCash.schema,
        StudentsGroup.schema,
        Groups.schema,
        Calendar.schema,
        GroupAttendance.schema,
        Tasks.schema,
    ],
    resolvers: [
        Countries.resolvers,
        Regions.resolvers,
        Employers.resolvers,
        Rooms.resolvers,
        Courses.resolvers,
        Students.resolvers,
        StudentsCash.resolvers,
        StudentsGroup.resolvers,
        Groups.resolvers,
        Calendar.resolvers,
        GroupAttendance.resolvers,
        Tasks.resolvers,
    ]
})