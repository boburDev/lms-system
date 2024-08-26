import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, OneToOne } from "typeorm";
import Students from "./students.entity";
import { CompanyBranches } from "../company/company.entity";
import StudentPayments from "./student_payments.entity";

@Entity()
export default class StudentCashes {
    @PrimaryGeneratedColumn('uuid')
    student_cash_id: string

    @Column({ type: 'float', default: 0 })
    cash_amount: number

    @Column({ type: 'int', nullable: false })
    check_number: number

    @Column({ type: 'int', nullable: false, default: 1 })
    check_type: number

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

    @OneToOne(() => StudentPayments, payment => payment.cashes)
    payment: StudentPayments;

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'branch_id' })
    branches: CompanyBranches

    @ManyToOne(() => Students, student => student.student_id)
    @JoinColumn({ name: 'student_id' })
    student: Students
}