import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, ObjectType, OneToOne } from "typeorm";
import Students from "./students.entity";
import { CompanyBranches } from "../company.entity";
import Student_payments from "./student_payments.entity";

@Entity()
export default class Student_cashes {
    @PrimaryGeneratedColumn('uuid')
    student_cash_id: string

    @Column({ type: 'float', default: 0 })
    cash_amount: number

    @Column({ type: 'int', nullable: false })
    check_number: number

    @Column({ type: 'timestamp' })
    student_cash_payed_at: Date

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    student_cash_created: Date

    @Column({ type: 'timestamp', nullable: true })
    student_cash_deleted: Date

    @Column()
    branch_id: string

    @Column()
    student_id: string

    @OneToOne(() => Student_payments, payment => payment.student_payment_id)
    payment: Student_payments;

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'branch_id' })
    branches: CompanyBranches

    @ManyToOne(() => Students, student => student.student_id)
    @JoinColumn({ name: 'student_id' })
    student: Students
}