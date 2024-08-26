import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "./company.entity";

@Entity()
export default class SmsServiceBranches {
    @PrimaryGeneratedColumn('uuid')
    sms_service_id: string

    @Column({ type: 'int', default: 0 })
    sms_count: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    sms_service_created: Date

    @Column()
    branch_id: string

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'branch_id' })
    branches: CompanyBranches
}