import { AddstudentPayment, studentPayment } from "../../../types/payment";
import AppDataSource from "../../../config/ormconfig";
import StudentPayments from "../../../entities/student/student_payments.entity";
import StudentCashes from "../../../entities/student/student_cashes.entity";
import StudentEntity from "../../../entities/student/students.entity";
import EmployerEntity from "../../../entities/employer/employers.entity";
import { paymentTypes } from "../../../utils/status_and_positions";
import { getChanges } from "../../../utils/eventRecorder";
import { IsNull } from "typeorm";

const resolvers = {
    Query: {
        studentPayments: async (_parametr: unknown, input: { studentId: string, type: number, startDate: string, endDate: string }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;

            try {
                let results: any = {
                    studentCash: [],
                    PaymentHistory: []
                }
                if (input.type == 1) {
                    let startDate = input.startDate ? new Date(input.startDate) : null
                    let endDate = input.endDate ? new Date(input.endDate) : null
                    const studentCashCountRepository = AppDataSource.getRepository(StudentCashes)
                    let query = await studentCashCountRepository.createQueryBuilder("cash")
                        .leftJoinAndSelect("cash.payment", "payment")
                        .leftJoinAndSelect("payment.employer", "employer")
                        .leftJoinAndSelect("cash.student", "student")
                        .where("cash.branch_id = :branchId", { branchId: context.branchId })
                    if (startDate instanceof Date && endDate instanceof Date) {
                        query = query.andWhere("cash.student_cash_created BETWEEN :startDate AND :endDate", {
                            startDate,
                            endDate
                        })
                    }
                    let data = await query
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
                    const studentPaymentCountRepository = AppDataSource.getRepository(StudentPayments)
                    let data = await studentPaymentCountRepository.createQueryBuilder("payment")
                        .leftJoinAndSelect("payment.employer", "employer")
                        .where("payment.student_id = :studentId", { studentId: input.studentId })
                        .orderBy("payment.student_payment_created", "DESC")
                        .getMany();
                    results.PaymentHistory = data

                }
                return results
            } catch (error) {
                await catchErrors(error, 'studentPayments', branchId);
                throw error;
            }
        },
        paymentById: async (_parametr: unknown, Id: { Id: string }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;

            try {
                const studentCashCountRepository = AppDataSource.getRepository(StudentCashes)
                let data = await studentCashCountRepository.createQueryBuilder("cash")
                    .leftJoinAndSelect("cash.payment", "payment")
                    .leftJoinAndSelect("payment.employer", "employer")
                    .leftJoinAndSelect("cash.student", "student")
                    .where("cash.branch_id = :branchId", { branchId: context.branchId })
                    .orderBy("cash.student_cash_created", "DESC")
                    .getOne();
                if (!data) throw new Error("Payment not found");

                return {
                    student_cash_id: data.student_cash_id,
                    student_id: data.student_id,
                    student_name: data.student.student_name,
                    employer_name: data.payment?.employer?.employer_name,
                    check_number: data.check_number,
                    cash_amount: data.cash_amount,
                    cash_type: data.check_type,
                    student_cash_payed_at: data.student_cash_payed_at,
                    student_cash_created: data.student_cash_created,
                }
            } catch (error) {
                await catchErrors(error, 'paymentById', branchId);
                throw error;
            }
        }
    },
    Mutation: {
        addStudentCash: async (_parent: unknown, { input }: { input: AddstudentPayment }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;

            try {
                const studentRepository = AppDataSource.getRepository(StudentEntity);

                // Validate student
                const studentData = await studentRepository.findOne({
                    where: { student_branch_id: branchId, student_id: input.studentId, student_deleted: IsNull() }
                });
                if (!studentData) throw new Error(`Student not found in branch`);

                // Update student balance
                studentData.student_balance += input.cashAmount;
                await studentRepository.save(studentData);

                // Add student cash entry
                const studentCashRepository = AppDataSource.getRepository(StudentCashes);
                const studentCash = new StudentCashes();
                studentCash.cash_amount = input.cashAmount;
                studentCash.check_type = paymentTypes(input.paymentType) as number;
                studentCash.check_number = (await studentCashRepository.count({ where: { branch_id: branchId } })) + 1;
                studentCash.student_cash_payed_at = new Date();
                studentCash.branch_id = branchId;
                studentCash.student_id = input.studentId;

                const studentCashData = await studentCashRepository.save(studentCash);

                // Add student payment entry
                const studentPaymentRepository = AppDataSource.getRepository(StudentPayments);
                const studentPayment = new StudentPayments();
                studentPayment.student_payment_debit = input.cashAmount;
                studentPayment.student_payment_type = paymentTypes(input.paymentType) as number;
                studentPayment.student_payment_payed_at = new Date();
                studentPayment.student_id = input.studentId;
                studentPayment.employer_id = context.colleagueId;
                studentPayment.student_cash_id = studentCashData.student_cash_id;
                await studentPaymentRepository.save(studentPayment);

                return {
                    student_cash_id: studentCashData.student_cash_id,
                    cash_amount: studentCashData.cash_amount,
                    cash_type: studentCashData.check_type,
                    check_number: studentCashData.check_number,
                    student_cash_payed_at: studentCashData.student_cash_payed_at,
                    student_cash_created: studentCashData.student_cash_created,
                    student_id: studentData.student_id,
                    student_name: studentData.student_name,
                    student_phone: studentData.student_phone,
                    employer_name: context.colleagueName
                };
            } catch (error) {
                await catchErrors(error, 'addStudentCash', branchId, input);
                throw error;
            }
        },

        returnStudentCash: async (_parent: unknown, { input }: { input: AddstudentPayment }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;

            try {
                const studentRepository = AppDataSource.getRepository(StudentEntity);

                const studentData = await studentRepository.findOne({
                    where: { student_branch_id: branchId, student_id: input.studentId, student_deleted: IsNull() }
                });
                if (!studentData) throw new Error(`Student not found in branch`);

                if (studentData.student_balance < input.cashAmount) throw new Error("Insufficient balance");

                // Update student balance
                studentData.student_balance -= input.cashAmount;
                await studentRepository.save(studentData);

                // Add student cash entry
                const studentCashRepository = AppDataSource.getRepository(StudentCashes);
                const studentCash = new StudentCashes();
                studentCash.cash_amount = -input.cashAmount;
                studentCash.check_type = paymentTypes(input.paymentType) as number;
                studentCash.check_number = (await studentCashRepository.count({ where: { branch_id: branchId } })) + 1;
                studentCash.student_cash_payed_at = new Date();
                studentCash.branch_id = branchId;
                studentCash.student_id = input.studentId;

                const studentCashData = await studentCashRepository.save(studentCash);

                // Add student payment entry
                const studentPaymentRepository = AppDataSource.getRepository(StudentPayments);
                const studentPayment = new StudentPayments();
                studentPayment.student_payment_credit = input.cashAmount;
                studentPayment.student_payment_type = paymentTypes(input.paymentType) as number;
                studentPayment.student_payment_payed_at = new Date();
                studentPayment.student_id = input.studentId;
                studentPayment.employer_id = context.colleagueId;
                studentPayment.student_cash_id = studentCashData.student_cash_id;
                await studentPaymentRepository.save(studentPayment);

                return "success";
            } catch (error) {
                await catchErrors(error, 'returnStudentCash', branchId, input);
                throw error;
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
        paymentType: (global: studentPayment) => paymentTypes(global.cash_type),
        payedAt: (global: studentPayment) => global.student_cash_payed_at,
        createdAt: (global: studentPayment) => global.student_cash_created,
    },
    PaymentHistory: {
        paymentHistoryId: (global: any) => global.student_payment_id,
        paymentHistoryDebit: (global: any) => global.student_payment_debit,
        paymentHistoryCredit: (global: any) => global.student_payment_credit,
        paymentHistoryType: (global: any) => paymentTypes(global.student_payment_type),
        paymentHistoryColleagueName: (global: any) => global.employer.employer_name,
        paymentHistoryPayed: (global: any) => global.student_payment_payed_at,
        paymentHistoryCreated: (global: any) => global.student_payment_created,
    }
}

export default resolvers;