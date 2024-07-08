import { gql } from 'apollo-server-express'

export default gql`
type Query {
    studentPayments(studentId: ID! type: Int! startDate: String endDate: String): studentPaymentsByType
}

type Mutation {
    addStudentCash(input: AddStudentCashInput): studentCash
    returnStudentCash(input: AddStudentCashInput): String
}

type studentPaymentsByType {
    studentCash: [studentCash]
    PaymentHistory: [PaymentHistory]
}

type studentCash {
    studentCashId: ID
    studentId: ID
    studentName: String
    employerName: String
    checkNumber: Int
    cashAmount: String
    paymentType: String
    payedAt: String
    createdAt: String
}

type PaymentHistory {
    paymentHistoryId: ID,
    paymentHistoryDebit: Int,
    paymentHistoryCredit: Float,
    paymentHistoryType: String,
    paymentHistoryColleagueName: String,
    paymentHistoryPayed: String,
    paymentHistoryCreated: String,
}

input AddStudentCashInput {
    studentId: ID!,
    cashAmount: Float!,
    paymentType: Int!,
    payedAt: String
}
`