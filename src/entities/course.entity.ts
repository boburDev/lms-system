import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "./company/company.entity";
import Groups from "./group/groups.entity";

@Entity()
export default class Courses {
    @PrimaryGeneratedColumn('uuid')
    course_id: string

    @Column({ length: 64, nullable: false, unique: true })
    course_name: string

    @Column({ nullable: false, type: 'numeric' })
    course_price: number

    @Column({ nullable: false, type: 'int' })
    course_duration: number

    @Column({ nullable: false, type:'int' })
    course_duration_lesson: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    course_created_at: Date
    
    @Column({ type: 'timestamp', nullable: true })
    course_deleted: Date

    @Column()
    course_branch_id: string

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'course_branch_id' })
    branches: CompanyBranches

    @OneToMany(() => Groups, group => group.course)
    group: Groups[];
}