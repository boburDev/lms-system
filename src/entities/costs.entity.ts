import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "./company.entity";
import Employers from "./employer/employers.entity";

@Entity()
export default class Costs {
    @PrimaryGeneratedColumn('uuid')
    cost_id: string

    @Column({ length: 64, nullable: false })
    cost_name: string
   
    @Column({ type: 'int' })
    cost_amount: number

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

// create table costs(
//     buyer varchar(64),
// );