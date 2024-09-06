import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "./company/company.entity";
import Employers from "./employer/employers.entity";

@Entity()
export default class EventActions {
    @PrimaryGeneratedColumn('uuid')
    event_action_id: string

    @Column()
    object_id: string

    @Column({ type: 'int' })
    event_action_type: number // created = 1, updated = 2, deleted = 3

    @Column({ type: 'text' })
    event_action_before: string

    @Column({ type: 'text' })
    event_action_after: string

    @Column({ type: 'varchar', length: 32 })
    event_action_object: string

    @Column({ type: 'varchar', length: 64, nullable: true })
    event_action_object_name: string | null
    
    @Column()
    employer_id: string
    
    @Column({ nullable: true })
    employer_name: string
    
    @Column()
    branch_id: string
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    event_action_created_at: Date

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'branch_id' })
    branches: CompanyBranches

    @ManyToOne(() => Employers, employers => employers.employer_id)
    @JoinColumn({ name: 'employer_id' })
    employers: Employers
}