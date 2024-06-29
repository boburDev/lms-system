import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "../company.entity";
import Funnel_Columns from "./columns.entity";
import Courses from "../course.entity";

@Entity()
export default class Leads {
    @PrimaryGeneratedColumn('uuid')
    lead_id: string

    @Column({ length: 64, nullable: false })
    lead_name: string
   
    @Column({ length: 16, nullable: false })
    lead_phone: string

    @Column({ type: 'int', default: 1 })
    lead_status: number
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lead_created: Date

    @Column({ type: 'timestamp', nullable: true })
    lead_deleted: Date

    @Column()
    lead_course_id: string
    
    @Column()
    lead_funnel_column_id: string
    
    @Column()
    lead_branch_id: string

    @ManyToOne(() => Courses, course => course)
    @JoinColumn({ name: 'lead_course_id' })
    courses: Courses

    @ManyToOne(() => Funnel_Columns, funnel_column => funnel_column)
    @JoinColumn({ name: 'lead_funnel_column_id' })
    funnel_columns: Funnel_Columns

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'lead_branch_id' })
    branches: CompanyBranches
}