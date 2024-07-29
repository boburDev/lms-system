import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Districts } from "../regions.entity";
import Employers from "../employer/employers.entity";
import Rooms from "../room.entity";
import Courses from "../course.entity";
import Students from "../student/students.entity";
import Student_payments from "../student/student_payments.entity";
import Funnels from "../funnel/funnels.entity";
import Daily_Time_Branches from "../application_usage/daily_time_branches.entity";
import Auto_Payment_Group from "../group/auto_payment.entity";
import Event_Actions from "../event_action.entity";
import Notifications from "../notification.entity";

@Entity()
export class Companies {   
    @PrimaryGeneratedColumn('uuid')
    company_id: string
    
    @Column({ length: 32, nullable: false, unique: true})
    company_name: string
    
    @OneToMany(() => CompanyBranches, branches => branches)
    branches: CompanyBranches[]
}

@Entity()
export class CompanyBranches {
    @PrimaryGeneratedColumn('uuid')
    company_branch_id: string
    
    @Column({ length: 64, nullable: false, default: 'Test' })
    company_branch_name: string
    
    @Column({ length: 32 })
    company_branch_phone: string
    
    @Column({ default: true})
    company_branch_status: boolean
    
    @Column({ type: 'numeric', default: 0})
    company_branch_balance: number
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    company_branch_created: Date
    
    @Column({ type: 'timestamp', nullable: true})
    company_branch_deleted: Date
    
    @Column()
    company_branch_subdomen: string
    
    @Column()
    branch_company_id: string

    @ManyToOne(() => Companies, companies => companies.company_id)
    @JoinColumn({ name: "branch_company_id"})
    companies: Companies

    @Column()
    branch_district_id: string

    @ManyToOne(()=> Districts, district => district.district_id)
    @JoinColumn({ name: "branch_district_id" })
    districts: Districts

    @OneToMany(() => Employers, employers => employers)
    branches: Employers[]

    @OneToMany(() => Rooms, rooms => rooms)
    rooms: Rooms[]

    @OneToMany(() => Courses, courses => courses)
    courses: Courses[]

    @OneToMany(() => Students, students => students)
    students: Students[]

    @OneToMany(() => Event_Actions, event_actions => event_actions)
    event_actions: Event_Actions[]

    @OneToMany(() => Daily_Time_Branches, dailyTime => dailyTime)
    daily_time_branches: Daily_Time_Branches[]

    @OneToMany(() => Funnels, funnels => funnels)
    funnels: Funnels[]

    @OneToMany(() => Auto_Payment_Group, paymentAuto => paymentAuto)
    auto_payment_group: Auto_Payment_Group[]
    
    @OneToMany(() => Notifications, notification => notification)
    notifications: Notifications[]

    @OneToMany(() => Student_payments, payment => payment)
    student_payment: Student_payments[]
}