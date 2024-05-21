import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, OneToOne } from "typeorm";
import Students from "./students.entity";
import Employers from "../employers.entity";
import Student_cashes from "./student_cashes.entity";

@Entity()
export default class Student_payments {
    @PrimaryGeneratedColumn('uuid')
    student_payment_id: string

    @Column({ type: 'float', default: 0 })
    student_payment_debit: number

    @Column({ type: 'float', default: 0 })
    student_payment_credit: number

    @Column({ length: 32, nullable: false })
    student_payment_type: string

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

    @OneToOne(() => Student_cashes, cash => cash.payment)
    @JoinColumn({ name: 'student_cash_id'})
    cashes: Student_cashes;
}
