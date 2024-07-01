import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "../company.entity";
import Employers from "./employers.entity";

@Entity()
export default class Salary {
    @PrimaryGeneratedColumn('uuid')
    salary_id: string

    @Column({ nullable: false })
    salary_amount: number

    @Column({ type: 'int', default: 1 })
    salary_type: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    salary_created: Date

    @Column({ type: 'timestamp', nullable: true })
    salary_deleted: Date

    @Column()
    salary_history_branch_id: string

    @Column()
    salary_history_employer_id: string

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'funnel_branch_id' })
    branches: CompanyBranches

    @ManyToOne(() => Employers, employer => employer.employer_id)
    @JoinColumn({ name: 'salary_history_employer_id' })
    employers: Employers
}