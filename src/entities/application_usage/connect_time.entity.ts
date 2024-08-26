import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "../company/company.entity";
import Employers from "../employer/employers.entity";

@Entity()
export default class ConnectTime {
    @PrimaryGeneratedColumn('uuid')
    connect_id: string

    @Column({ type: 'bigint' })
    connect_time: number

    @Column({ type: 'bigint', default: 0 })
    disconnect_time: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    connect_time_created: Date

    @Column()
    branch_id: string

    @Column()
    colleague_id: string

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'branch_id' })
    branches: CompanyBranches

    @ManyToOne(type => Employers, employer => employer)
    @JoinColumn({ name: 'colleague_id' })
    employer: Employers;
}