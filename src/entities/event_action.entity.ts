import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "./company/company.entity";
import Employers from "./employer/employers.entity";

@Entity()
export default class Event_Actions {
    @PrimaryGeneratedColumn('uuid')
    event_action_id: string

    @Column({ type: 'int' })
    event_action_type: number // created, deleted, updated

    @Column({ type: 'text' })
    event_action_before: string

    @Column({ type: 'text' })
    event_action_after: string

    @Column({ type: 'varchar', length: 32 })
    event_action_object: string

    @Column({ type: 'varchar', length: 64 })
    event_action_object_name: string
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    event_action_created_at: Date

    @Column()
    employer_id: string

    @Column()
    branch_id: string

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'branch_id' })
    branches: CompanyBranches

    @ManyToOne(() => Employers, employers => employers.employer_id)
    @JoinColumn({ name: 'employer_id' })
    employers: Employers
}