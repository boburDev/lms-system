import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "./company.entity";
import Discounts from "../options/discount.entity";

@Entity()
export default class Branch_Discounts {
    @PrimaryGeneratedColumn('uuid')
    branch_discount_id: string

    @Column({ type: 'timestamp', nullable: false })
    group_start_date: Date

    @Column({ type: 'timestamp', nullable: false })
    group_end_date: Date

    @Column({ default: true })
    is_active: boolean

    @Column({ type: "int", default: 0 })
    reason: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    branch_discount_created: Date

    @Column()
    discount_id: string

    @Column()
    branch_id: string

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'branch_id' })
    branches: CompanyBranches

    @ManyToOne(() => Discounts, discount => discount.discount_id)
    @JoinColumn({ name: 'discount_id' })
    discounts: Discounts
}