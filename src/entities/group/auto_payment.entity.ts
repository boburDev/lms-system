import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "../company/company.entity";
import Groups from "./groups.entity";

@Entity()
export default class AutoPaymentGroup {
    @PrimaryGeneratedColumn('uuid')
    auto_payment_group_id: string

    @Column({ type: 'int', default: 1 })
    payment_status: number

    @Column({ type: 'timestamp' })
    payment_month: Date

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    connect_time_created: Date

    @Column()
    branch_id: string

    @Column()
    group_id: string

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'branch_id' })
    branches: CompanyBranches

    @ManyToOne(() => Groups, group => group.group_id)
    @JoinColumn({ name: 'group_id' })
    groups: Groups
}