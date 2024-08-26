import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "../company/company.entity";
import FunnelColumns from "./columns.entity";
import Courses from "../course.entity";
import Employers from "../employer/employers.entity";
import Funnels from "./funnels.entity";

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

    @Column({ type: 'int', nullable: true, default: 1 })
    lead_order: number | null

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lead_created: Date

    @Column({ type: 'timestamp', nullable: true })
    lead_deleted: Date

    @Column({ nullable: true })
    lead_course_id: string

    @Column()
    lead_employer_id: string
    
    @Column()
    lead_funnel_column_id: string
    
    @Column()
    lead_funnel_id: string
    
    @Column()
    lead_branch_id: string

    @ManyToOne(() => Courses, course => course)
    @JoinColumn({ name: 'lead_course_id' })
    courses: Courses

    @ManyToOne(() => FunnelColumns, funnel_column => funnel_column.leads)
    @JoinColumn({ name: 'lead_funnel_column_id' })
    funnel_columns: FunnelColumns
    
    @ManyToOne(() => Funnels, funnels => funnels.leads)
    @JoinColumn({ name: 'lead_funnel_id' })
    funnels: Funnels

    @ManyToOne(() => Employers, employers => employers)
    @JoinColumn({ name: 'lead_employer_id' })
    employers: Employers

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'lead_branch_id' })
    branches: CompanyBranches
}


