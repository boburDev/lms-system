import { AddstudentPayment, studentPayment } from "../../../types/payment";
import AppDataSource from "../../../config/ormconfig";
import Student_payments from "../../../entities/student/student_payments.entity";
import Student_cashes from "../../../entities/student/student_cashes.entity";
import StudentEntity from "../../../entities/student/students.entity";
import EmployerEntity from "../../../entities/employer/employers.entity";

const resolvers = {
    Query: {
        studentPayments: async (_parametr: unknown, input: { studentId: string, type: number, startDate: string, endDate: string }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            let results: any = {
                studentCash: [],
                PaymentHistory: []
            }
            if (input.type == 1) {
                const studentCashCountRepository = AppDataSource.getRepository(Student_cashes)
                let data = await studentCashCountRepository.createQueryBuilder("cash")
                    .leftJoinAndSelect("cash.payment", "payment")
                    .leftJoinAndSelect("payment.employer", "employer")
                    .leftJoinAndSelect("cash.student", "student")
                    .where("cash.branch_id = :branchId", { branchId: context.branchId })
                    .orderBy("cash.student_cash_created", "DESC")
                    .getMany();
                let result = []
                for (const i of data) {
                    result.push({
                        student_cash_id: i.student_cash_id,
                        student_id: i.student_id,
                        student_name: i.student.student_name,
                        employer_name: i.payment?.employer?.employer_name,
                        check_number: i.check_number,
                        cash_amount: i.cash_amount,
                        cash_type: i.check_type,
                        student_cash_payed_at: i.student_cash_payed_at,
                        student_cash_created: i.student_cash_created,
                    })
                }
                results.studentCash.push(...result)
            } else if (input.type == 2) {
                const studentPaymentCountRepository = AppDataSource.getRepository(Student_payments)
                let data = await studentPaymentCountRepository.createQueryBuilder("payment")
                    .leftJoinAndSelect("payment.employer", "employer")
                    .where("payment.student_id = :studentId", { studentId: input.studentId })
                    .orderBy("payment.student_payment_created", "DESC")
                    .getMany();
                results.PaymentHistory = data
            }
            return results
        }
    },
    Mutation: {
        addStudentCash: async (_parent: unknown, { input }: { input: AddstudentPayment }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const studentRepository = AppDataSource.getRepository(StudentEntity)

            let data = await studentRepository.createQueryBuilder("students")
                .where("students.student_branch_id = :branchId", { branchId: context.branchId })
                .andWhere("students.student_id = :Id", { Id: input.studentId })
                .andWhere("students.student_deleted IS NULL")
                .getOne()

            if (data === null) throw new Error(`Bu uquv markazida ushbu uquvchi mavjud`)
            data.student_balance = data.student_balance + input.cashAmount
            await studentRepository.save(data)

            const studentCashCountRepository = AppDataSource.getRepository(Student_cashes)
            let studentCash = new Student_cashes()
            let count = await studentCashCountRepository.find({ where: { branch_id: context.branchId } })
            studentCash.cash_amount = input.cashAmount
            studentCash.check_type = input.paymentType
            studentCash.check_number = count.length + 1
            studentCash.student_cash_payed_at = new Date()
            studentCash.branch_id = context.branchId
            studentCash.student_id = input.studentId

            let studentCashData = await studentCashCountRepository.save(studentCash)

            const studentPaymentRepository = AppDataSource.getRepository(Student_payments)
            let studentPayment = new Student_payments()
            studentPayment.student_payment_debit = input.cashAmount
            studentPayment.student_payment_type = input.paymentType
            studentPayment.student_payment_payed_at = new Date()
            studentPayment.student_id = input.studentId
            studentPayment.employer_id = context.colleagueId
            studentPayment.student_cash_id = studentCashData.student_cash_id

            let studentPaymentData = await studentPaymentRepository.save(studentPayment)

            const employerRepository = AppDataSource.getRepository(EmployerEntity)
            let dataEmployer = await employerRepository.createQueryBuilder("employer")
                .where("employer.employer_id = :Id", { Id: context.colleagueId })
                .andWhere("employer.employer_branch_id = :id", { id: context.branchId })
                .andWhere("employer.employer_deleted IS NULL")
                .getOne()

            if (dataEmployer === null) throw new Error("Xodim malumoti tuliq emas");

            return {
                student_cash_id: studentCashData.student_cash_id,
                cash_amount: studentCashData.cash_amount,
                cash_type: studentCashData.check_type,
                check_number: studentCashData.check_number,
                student_cash_payed_at: studentCashData.student_cash_payed_at,
                student_cash_created: studentCashData.student_cash_created,
                student_id: data.student_id,
                student_name: data.student_name,
                student_phone: data.student_phone,
                employer_name: dataEmployer.employer_name,
            }
        },
        returnStudentCash: async (_parent: unknown, { input }: { input: AddstudentPayment }, context: any) => {
            console.log(input);
            if (!context?.branchId) throw new Error("Not exist access token!");
            const studentRepository = AppDataSource.getRepository(StudentEntity)

            let data = await studentRepository.createQueryBuilder("students")
                .where("students.student_branch_id = :branchId", { branchId: context.branchId })
                .andWhere("students.student_id = :Id", { Id: input.studentId })
                .andWhere("students.student_deleted IS NULL")
                .getOne()

            if (data === null) throw new Error(`Bu uquv markazida ushbu uquvchi mavjud`)

            if (data.student_balance >= input.cashAmount) {
                data.student_balance = data.student_balance - input.cashAmount
                await studentRepository.save(data)

                const studentCashCountRepository = AppDataSource.getRepository(Student_cashes)
                let studentCash = new Student_cashes()
                let count = await studentCashCountRepository.find({ where: { branch_id: context.branchId } })
                studentCash.cash_amount = -input.cashAmount
                studentCash.check_type = input.paymentType
                studentCash.check_number = count.length + 1
                studentCash.student_cash_payed_at = new Date()
                studentCash.branch_id = context.branchId
                studentCash.student_id = input.studentId

                let studentCashData = await studentCashCountRepository.save(studentCash)

                const studentPaymentRepository = AppDataSource.getRepository(Student_payments)
                let studentPayment = new Student_payments()
                studentPayment.student_payment_credit = input.cashAmount
                studentPayment.student_payment_type = input.paymentType
                studentPayment.student_payment_payed_at = new Date()
                studentPayment.student_id = input.studentId
                studentPayment.employer_id = context.colleagueId
                studentPayment.student_cash_id = studentCashData.student_cash_id

                let studentPaymentData = await studentPaymentRepository.save(studentPayment)

                return "success"
            } else {
                return "failed"
            }
        }
    },
    studentCash: {
        studentCashId: (global: studentPayment) => global.student_cash_id,
        studentId: (global: studentPayment) => global.student_id,
        studentName: (global: studentPayment) => global.student_name,
        employerName: (global: studentPayment) => global.employer_name,
        checkNumber: (global: studentPayment) => global.check_number,
        cashAmount: (global: studentPayment) => global.cash_amount,
        paymentType: (global: studentPayment) => global.cash_type,
        payedAt: (global: studentPayment) => global.student_cash_payed_at,
        createdAt: (global: studentPayment) => global.student_cash_created,
    },
    PaymentHistory: {
        paymentHistoryId: (global: any) => global.student_payment_id,
        paymentHistoryDebit: (global: any) => global.student_payment_debit,
        paymentHistoryCredit: (global: any) => global.student_payment_credit,
        paymentHistoryType: (global: any) => global.student_payment_type,
        paymentHistoryColleagueName: (global: any) => global.employer.employer_name,
        paymentHistoryPayed: (global: any) => global.student_payment_payed_at,
        paymentHistoryCreated: (global: any) => global.student_payment_created,
    }
}

export default resolvers;