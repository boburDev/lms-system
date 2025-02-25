import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "../company/company.entity";
import Employers from "../employer/employers.entity";
import Rooms from "../room.entity";
import Courses from "../course.entity";
import StudentGroups, { StudentAttendences } from "../student/student_groups.entity";
import SalaryHistory from "../employer/salary-history.entity";
import AutoPaymentGroup from "./auto_payment.entity";

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

    @OneToMany(() => GroupAttendences, attendence => attendence.groups)
    attendence: GroupAttendences[]
    
    @OneToMany(() => StudentAttendences, attendence => attendence.student_attendence)
    student_attendences: StudentAttendences[]

    @OneToMany(() => SalaryHistory, history => history.salary_history_id)
    salary_histories: SalaryHistory[];

    @OneToMany(() => StudentGroups, st_group => st_group.group)
    student_group: StudentGroups[]

    @OneToMany(() => AutoPaymentGroup, paymentAuto => paymentAuto)
    auto_payment_group: AutoPaymentGroup[]
}

@Entity()
export class GroupAttendences {
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
