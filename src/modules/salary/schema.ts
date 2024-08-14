import { gql } from 'apollo-server-express'

export default gql`
type Query {
  salary: SalarySum!
}

type Mutation {
  updateSalary(input: UpdateSalaryInput): Salary!
}

type SalarySum {
    Salary: [Salary],
    Sum: Int!
}

type Salary {
  salaryId: String!
  colleagueId: String
  colleagueName: String
  salaryAmount: Int!
  salaryType: Int!
}

input UpdateSalaryInput {
  salaryId: String!
  salaryAmount: Int!
  salaryType: Int!
}
`