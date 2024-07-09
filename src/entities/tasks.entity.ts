import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "./company/company.entity";
import Employers from "./employer/employers.entity";

@Entity()
export default class Tasks {
    @PrimaryGeneratedColumn('uuid')
    task_id: string

    @Column({ length: 64, nullable: false })
    task_title: string

    @Column({ nullable: false })
    task_body: string

    @Column({ type: 'timestamp', nullable: false })
    task_start_date: Date

    @Column({ type: 'timestamp', nullable: false })
    task_end_date: Date

    @Column({ type: 'int' })
    task_type: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    task_created: Date

    @Column({ type: 'timestamp', nullable: true })
    task_deleted: Date

    @Column()
    task_branch_id: string

    @Column()
    colleague_id: string

    @Column()
    colleague_id_task_from: string

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'task_branch_id' })
    branches: CompanyBranches
    
    @ManyToOne(() => Employers, employer => employer.employer_id)
    @JoinColumn({ name: 'colleague_id' })
    colleague_task: Employers
    
    @ManyToOne(() => Employers, employer => employer.employer_id)
    @JoinColumn({ name: 'colleague_id_task_from' })
    colleague_task_from: Employers
}