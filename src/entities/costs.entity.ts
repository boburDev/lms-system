import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "./company/company.entity";
import Employers from "./employer/employers.entity";

@Entity()
export default class Costs {
    @PrimaryGeneratedColumn('uuid')
    cost_id: string

    @Column({ length: 64 })
    cost_name: string
   
    @Column({ type: 'int' })
    cost_amount: number

    @Column({ type: 'int' })
    cost_type: number
    
    @Column({ length: 32, nullable: true })
    cost_type_value: string

    @Column({ type: 'timestamp', nullable: true })
    cost_payed_at: Date

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    cost_created: Date

    @Column({ type: 'timestamp', nullable: true })
    cost_deleted: Date

    @Column()
    colleague_id: string

    @Column()
    cost_branch_id: string

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'cost_branch_id' })
    branches: CompanyBranches

    @ManyToOne(() => Employers, employer => employer)
    @JoinColumn({ name: 'colleague_id' })
    colleagues: Employers
}