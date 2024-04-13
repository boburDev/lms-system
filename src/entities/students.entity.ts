import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "./company.entity";

@Entity()
export default class Students {
    @PrimaryGeneratedColumn('uuid')
    student_id: string

    @Column({ length: 64, nullable: false })
    student_name: string
    
    @Column({ length: 16, nullable: false })
    student_phone: string
    
    @Column({ length: 64 })
    student_password: string
    
    @Column({ type: 'int', default: 1 })
    student_status: number
    
    @Column({ type: 'int', default: 0 })
    student_balance: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    student_created: Date

    @Column({ type: 'timestamp', nullable: true })
    student_deleted: Date

    @Column()
    student_branch_id: string

    @Column({ nullable: true })
    colleague_id: string

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'student_branch_id' })
    branches: CompanyBranches
}