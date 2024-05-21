import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, OneToMany, Check } from "typeorm";
import { CompanyBranches } from "./company.entity";
import Student_payments from './student_payments.entity'
import { ParentInfo } from "../types/students"
import Student_cashes from "./student_cashes.entity";

@Entity()
export default class Students {
    @PrimaryGeneratedColumn('uuid')
    student_id: string

    @Column({ length: 64, nullable: false })
    student_name: string
    
    @Column({ length: 16, nullable: false })
    student_phone: string
    
    @Column({ length: 64, nullable: true })
    student_password: string
    
    @Column({ type: 'timestamp', nullable: true })
    student_birthday: Date
    
    @Column({ type: 'int', nullable: true })
    @Check(`"student_gender" IS NULL OR "student_gender" IN (1, 2)`)
    student_gender: number
    
    @Column({ type: 'int', default: 1 })
    student_status: number
    
    @Column({ type: 'float', default: 0 })
    student_balance: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    student_created: Date

    @Column({ type: 'timestamp', nullable: true })
    student_deleted: Date

    @Column({ type: 'json', nullable: true })
    parentsInfo: ParentInfo[];

    @Column()
    student_branch_id: string

    @Column({ nullable: true })
    colleague_id: string

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'student_branch_id' })
    branches: CompanyBranches

    @OneToMany(() => Student_payments, payment => payment.student)
    student_payment: Student_payments[]

    @OneToMany(() => Student_cashes, cash => cash.student)
    student_cash: Student_cashes[]
}
