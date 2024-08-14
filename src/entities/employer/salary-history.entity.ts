import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Employers from "./employers.entity";

@Entity()
export default class Salary_History {
    @PrimaryGeneratedColumn('uuid')
    salary_history_id: string

    @Column({ nullable: false })
    salary_amount: number
    
    @Column({ nullable: false })
    salary_type: number
    
    @Column({ nullable: false })
    salary_type_value: number

    @Column({ type: 'timestamp' })
    for_month: Date

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    salary_history_created: Date

    @Column()
    salary_history_employer_id: string

    @ManyToOne(() => Employers, employer => employer.employer_id)
    @JoinColumn({ name: 'salary_history_employer_id' })
    employers: Employers
}