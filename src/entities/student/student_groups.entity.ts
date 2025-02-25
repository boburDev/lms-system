import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Students from "./students.entity";
import Groups from "../group/groups.entity";

@Entity()
export default class StudentGroups {
    @PrimaryGeneratedColumn('uuid')
    student_group_id: string

    @Column({ type: 'float', default: 0.0 })
    student_group_discount: number

    @Column({ type: 'int', default: 1 })
    student_group_discount_type: number

    @Column({ type: 'timestamp', nullable: true })
    student_group_discount_start: Date | null

    @Column({ type: 'timestamp', nullable: true })
    student_group_discount_end: Date | null
    
    @Column({ type: 'timestamp', nullable: false })
    student_group_add_time: Date
    
    @Column({ type: 'timestamp', nullable: true })
    student_left_group_time: Date

    @Column({ type: 'int', default: 1 })
    student_group_status: number
    
    @Column({ type: 'timestamp', nullable: false })
    student_group_lesson_end: Date

    @Column({ type: 'float', default: 0.0 })
    student_group_credit: number

    @Column()
    group_id: string

    @Column()
    student_id: string

    @ManyToOne(() => Groups, group => group.group_id)
    @JoinColumn({ name: 'group_id' })
    group: Groups

    @ManyToOne(() => Students, student => student.student_id)
    @JoinColumn({ name: 'student_id' })
    student: Students
}

@Entity()
export class StudentAttendences {
    @PrimaryGeneratedColumn('uuid')
    student_attendence_id: string

    @Column({ type: 'timestamp' })
    student_attendence_day: Date

    @Column({ type: 'int', default: 1 })
    student_attendence_status: number

    @Column({ nullable: false })
    student_attendence_group_id: string
    
    @Column({ nullable: false })
    student_attendence_student_id: string

    @ManyToOne(() => Groups, group => group.group_id, { cascade: true })
    @JoinColumn({ name: 'student_attendence_group_id' })
    student_attendence: Groups

    @ManyToOne(() => Students, student => student.student_id, { cascade: true })
    @JoinColumn({ name: 'student_attendence_student_id' })
    students: Students
}