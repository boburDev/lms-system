import { gql } from 'apollo-server-express'

export default gql`
type Query {
  courses: [Course]!
  coursById(Id: String!): Course!
  courseGroups(courseId: String!): [Group]!
}

type Mutation {
  addCourse(input: AddCourseInput) : Course!
  updateCourse(input: UpdateCourseInput) : Course!
  deleteCourse(courseId: String!) : Course!
}

type Course {
	courseId: String!
  courseName: String!
  coursePrice: Float!
  courseDuration: Int!
  courseDurationLesson: Int!
}

input AddCourseInput {
  courseName: String!
  coursePrice: Float!
  courseDuration: Int!
  courseDurationLesson: Int!
}

input UpdateCourseInput {
  courseId: String!
  courseName: String!
  coursePrice: Float!
  courseDuration: Int!
  courseDurationLesson: Int!
}
`
