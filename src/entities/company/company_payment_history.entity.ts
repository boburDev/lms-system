import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "./company.entity";

@Entity()
export default class Branch_Payment_History {
    @PrimaryGeneratedColumn('uuid')
    payment_history_id: string

    @Column({ type: 'int', nullable: false })
    payment_ammount: number

    @Column({ type: 'varchar', nullable: true })
    @Check(`"payment_app_type" IN ('payme', 'click')`)
    payment_app_type: string

    @Column({ default: true })
    is_payment: boolean

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    payment_history_created: Date

    @Column()
    branch_id: string

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'branch_id' })
    branches: CompanyBranches
}