import { gql } from 'apollo-server-express'

export default gql`
type Query {
  tasks: [Task]!
}

type Mutation {
  addTask(input: AddTaskInput) : Task!
  deleteTask(taskId: String!) : Task!
}

type Task {
	taskId: String!
  taskTitle: String!
  taskBody: String!
  taskStartDate: String!
  taskEndDate: String!
  taskType: Int!
  taskFromColleagueId: String!
  taskColleagueId: String!
}

input AddTaskInput {
  taskTitle: String!
  taskBody: String!
  taskStartDate: String!
  taskEndDate: String!
  taskType: Int!
  taskFromColleagueId: String!
}
`