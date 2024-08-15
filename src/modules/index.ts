import { makeExecutableSchema } from '@graphql-tools/schema'

import Countries from './countries'
import Regions from './regions'
import Companies from './companies'
import Employers from './employers'
import Rooms from './rooms'
import Courses from './courses'
import Students from './students/student'
import StudentsDiscount from './students/discount'
import StudentsCash from './students/payment'
import StudentsGroup from './students/group'
import Groups from './groups/group'
import GroupAttendance from './groups/attendance'
import Tasks from './tasks'
import Calendar from './groups/calendar'
import Costs from './costs'
import Funnels from './leads/funnels'
import FunnelColumns from './leads/columns'
import Leads from './leads/leads'
import UserDashboard from './dashboard/user'

export default makeExecutableSchema({
    typeDefs: [
        Countries.schema,
        Regions.schema,
        Companies.schema,
        Employers.schema,
        Rooms.schema,
        Courses.schema,
        Students.schema,
        StudentsCash.schema,
        StudentsGroup.schema,
        StudentsDiscount.schema,
        Groups.schema,
        Calendar.schema,
        GroupAttendance.schema,
        Tasks.schema,
        Costs.schema,
        Funnels.schema,
        FunnelColumns.schema,
        Leads.schema,
        UserDashboard.schema,
    ],
    resolvers: [
        Countries.resolvers,
        Regions.resolvers,
        Companies.resolvers,
        Employers.resolvers,
        Rooms.resolvers,
        Courses.resolvers,
        Students.resolvers,
        StudentsCash.resolvers,
        StudentsGroup.resolvers,
        StudentsDiscount.resolvers,
        Groups.resolvers,
        Calendar.resolvers,
        GroupAttendance.resolvers,
        Tasks.resolvers,
        Costs.resolvers,
        Funnels.resolvers,
        FunnelColumns.resolvers,
        Leads.resolvers,
        UserDashboard.resolvers,
    ]
})