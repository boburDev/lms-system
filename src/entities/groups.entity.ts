import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "./company.entity";
import bcrypt from 'bcrypt';

@Entity()
export default class Groups {   
    @PrimaryGeneratedColumn('uuid')
    group_id: string
    
    @Column({ length: 32, nullable: false})
    group_name: string
    
    @Column({ nullable: false})
    group_course_id: string

    @Column({ nullable: false })
    group_colleague_id: string

    @Column('integer', { array: true })
    group_days: number[];

    @Column({ nullable: false })
    group_room_id: string

    @Column({ nullable: false })
    group_start_date: string

    @Column({ nullable: false })
    group_end_date: string
    
    @Column({ nullable: false })
    group_start_time: string

    @Column({ nullable: false })
    group_end_time: string
    
    @Column('int')
    group_lesson_count: number
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    group_created: Date
    
    @Column({ type: 'timestamp', nullable: true})
    group_deleted: Date
    
    @Column()
    group_branch_id: string

    @ManyToOne(()=> CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'employer_branch_id' })
    branches: CompanyBranches
}