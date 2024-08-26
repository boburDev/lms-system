import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, OneToOne } from "typeorm";
import Students from "./students.entity";
import Employers from "../employer/employers.entity";
import StudentCashes from "./student_cashes.entity";
// select
// student_payment_debit,
// student_payment_credit,
// student_payment_type
// from student_payments where student_id = 'fed33499-77d3-42f7-b1b6-70084a8b2022';
@Entity()
export default class StudentPayments {
    @PrimaryGeneratedColumn('uuid')
    student_payment_id: string

    @Column({ type: 'float', default: 0 })
    student_payment_debit: number

    @Column({ type: 'float', default: 0 })
    student_payment_credit: number

    @Column({ nullable: false })
    student_payment_type: number

    @Column({ type: 'timestamp' })
    student_payment_payed_at: Date

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    student_payment_created: Date

    @Column({ type: 'timestamp', nullable: true })
    student_payment_deleted: Date

    @Column()
    student_id: string

    @Column()
    employer_id: string

    @Column()
    student_cash_id: string

    @ManyToOne(() => Students, student => student.student_payment)
    @JoinColumn({ name: 'student_id' })
    student: Students
    
    @ManyToOne(() => Employers, employer => employer.employer_id)
    @JoinColumn({ name: 'employer_id' })
    employer: Employers

    @OneToOne(() => StudentCashes, cash => cash.payment)
    @JoinColumn({ name: 'student_cash_id'})
    cashes: StudentCashes;
}
