import { gql } from 'apollo-server-express'

export default gql`
type Query {
  tasks: [Task]!
  taskById(Id: String!): Task!
}

type Mutation {
  addTask(input: AddTaskInput) : Task!
  updateTask(input: UpdateTaskInput) : Task!
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
  taskFromColleagueName: String!
  taskColleagueId: String!
  taskColleagueName: String!
}

input AddTaskInput {
  taskTitle: String!
  taskBody: String!
  taskStartDate: String!
  taskEndDate: String!
  taskType: Int!
  taskToColleagueId: String!
}
input UpdateTaskInput {
  taskId: String
  taskTitle: String
  taskBody: String
  taskStartDate: String
  taskEndDate: String
  taskType: Int
  taskFromColleagueId: String
  taskToColleagueId: String
}
`