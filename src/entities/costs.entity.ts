import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "./company.entity";

@Entity()
export default class Costs {
    @PrimaryGeneratedColumn('uuid')
    cost_id: string

    @Column({ length: 64, nullable: false })
    cost_name: string
   
    @Column({ type: 'int' })
    cost_amount: number

    @Column({ type: 'varchar', length: 20 })
    colleague_name: string

    @Column({ type: 'timestamp', nullable: true })
    cost_payed_at: Date

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    cost_created: Date

    @Column({ type: 'timestamp', nullable: true })
    cost_deleted: Date

    @Column()
    cost_branch_id: string

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'cost_branch_id' })
    branches: CompanyBranches
}

// create table costs(
//     buyer varchar(64),
// );