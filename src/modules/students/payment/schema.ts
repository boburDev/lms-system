import { gql } from 'apollo-server-express'

export default gql`
type Query {
    studentPayments(studentId: ID! type: Int! startDate: String endDate: String): clientPaymentsByString
}

type Mutation {
    addStudentCash(input: AddStudentCashInput): studentCash
}

type studentPaymentsByType {
    studentCashes: [studentCash]
    PaymentHistory: [PaymentHistory]
}

type studentCash {
    studentCashId: ID
    studentId: ID
    studentName: String
    checkNumber: Int
    cashAmount: Int
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