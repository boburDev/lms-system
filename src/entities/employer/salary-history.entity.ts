import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "../company/company.entity";
import Employers from "./employers.entity";
import Groups from "../group/groups.entity";

@Entity()
export default class Salary_History {
    @PrimaryGeneratedColumn('uuid')
    salary_history_id: string

    @Column({ nullable: false })
    salary_amount: number

    @Column({ type: 'timestamp' })
    for_month: Date

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    salary_history_created: Date

    @Column({ type: 'timestamp', nullable: true })
    salary_history_deleted: Date

    @Column()
    salary_history_branch_id: string

    @Column()
    salary_history_employer_id: string

    @Column()
    salary_history_group_id: string

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'funnel_branch_id' })
    branches: CompanyBranches

    @ManyToOne(() => Employers, employer => employer.employer_id)
    @JoinColumn({ name: 'salary_history_employer_id' })
    employers: Employers

    @ManyToOne(() => Groups, group => group.group_id, { cascade: true })
    @JoinColumn({ name: 'salary_history_group_id' })
    groups: Groups
}