import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "../company/company.entity";
import Employers from "../employer/employers.entity";
import Rooms from "../room.entity";
import Courses from "../course.entity";
import Student_groups, { Student_attendences } from "../student/student_groups.entity";
import Salary_History from "../employer/salary-history.entity";
import Auto_Payment_Group from "./auto_payment.entity";

@Entity()
export default class Groups {   
    @PrimaryGeneratedColumn('uuid')
    group_id: string
    
    @Column({ length: 32, nullable: false})
    group_name: string

    @Column({ nullable: false })
    group_colleague_id: string

    @Column({ nullable: false })
    group_days: string;

    @Column({ nullable: false })
    group_room_id: string

    @Column({ nullable: false })
    group_course_id: string
    
    @Column({ type: 'timestamp', nullable: false })
    group_start_date: Date

    @Column({ type: 'timestamp', nullable: false })
    group_end_date: Date
    
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
    @JoinColumn({ name: 'group_branch_id' })
    branches: CompanyBranches

    @ManyToOne(type => Employers, employer => employer)
    @JoinColumn({ name: 'group_colleague_id'})
    employer: Employers;
    
    @ManyToOne(type => Rooms, room => room)
    @JoinColumn({ name: 'group_room_id'})
    room: Rooms;
    
    @ManyToOne(type => Courses, course => course)
    @JoinColumn({ name: 'group_course_id'})
    course: Courses;

    @OneToMany(() => Group_attendences, attendence => attendence.groups)
    attendence: Group_attendences[]
    
    @OneToMany(() => Student_attendences, attendence => attendence.student_attendence)
    student_attendences: Student_attendences[]

    @OneToMany(() => Salary_History, history => history.salary_history_id)
    salary_histories: Salary_History[];

    @OneToMany(() => Student_groups, st_group => st_group.group)
    student_group: Student_groups[]

    @OneToMany(() => Auto_Payment_Group, paymentAuto => paymentAuto)
    auto_payment_group: Auto_Payment_Group[]
}

@Entity()
export class Group_attendences {
    @PrimaryGeneratedColumn('uuid')
    group_attendence_id: string

    @Column({ type: 'timestamp' })
    group_attendence_day: Date
    
    @Column({ type: 'int', default: 1 })
    group_attendence_status: number
    
    @Column({ nullable: false })
    group_attendence_group_id: string

    @ManyToOne(() => Groups, group => group.group_id, { cascade: true })
    @JoinColumn({ name: 'group_attendence_group_id' })
    groups: Groups
}
