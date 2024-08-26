import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "./company.entity";

@Entity()
export default class BranchActivities {
    @PrimaryGeneratedColumn('uuid')
    branch_activity_id: string

    @Column({ type: 'timestamp', nullable: false })
    group_start_date: Date

    @Column({ type: 'timestamp', nullable: false })
    group_end_date: Date

    @Column({ default: true })
    branch_activity_status: boolean

    @Column()
    branch_id: string

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'branch_id' })
    branches: CompanyBranches
}