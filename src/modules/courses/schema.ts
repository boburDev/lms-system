import { gql } from 'apollo-server-express'

export default gql`
type Query {
  courses: [Course]!
}

type Mutation {
  addCourse(input: AddCourseInput) : Course!
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
`
