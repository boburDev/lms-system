import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "../company/company.entity";
import bcrypt from 'bcrypt';
import Groups from "../group/groups.entity";
import StudentPayments from "../student/student_payments.entity";
import Tasks from "../tasks.entity";
import Leads from "../funnel/leads.entity";
import SalaryHistory from "./salary-history.entity";
import ForgetPassword from "../options/forget_password.entity";
import ConnectTime from "../application_usage/connect_time.entity";
import DailyTimeColleagues from "../application_usage/daily_time_colleagues.entity";
import EventActions from "../event_action.entity";
import { Permission } from "../../modules/employers/resolvers";
// import { RolePermissions } from "../../interfaces/role_permissions";

@Entity()
export default class Employers {   
    @PrimaryGeneratedColumn('uuid')
    employer_id: string
    
    @Column({ length: 32, nullable: false})
    employer_name: string
    
    @Column({ length: 32, nullable: false})
    employer_phone: string

    @Column({ type: 'timestamp', nullable: true })
    employer_birthday: Date | null

    @Column({ type: 'int', nullable: true })
    employer_gender: number | null

    @Column({ length: 64, nullable: true })
    employer_password: string

    @Column({ nullable: true })
    employer_position: number

    @Column({ type: "boolean", nullable: true, default: true })
    employer_activated: boolean

    @Column({ type: 'boolean', nullable: true, default: true })
    employer_notification_mode: boolean
    
    @Column({ length: 4, default: 'ru' })
    employer_usage_lang: string
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    employer_created: Date
    
    @Column({ type: 'timestamp', nullable: true})
    employer_deleted: Date

    @Column({ type: 'jsonb', nullable: false, default: {} })
    permissions: Permission;
    
    @Column()
    employer_branch_id: string

    @ManyToOne(()=> CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'employer_branch_id' })
    branches: CompanyBranches

    @OneToMany(() => Groups, group => group.group_id)
    group: Groups[];

    @OneToMany(() => SalaryHistory, history => history.salary_history_id)
    salary_histories: SalaryHistory[];

    @OneToMany(() => EventActions, event_actions => event_actions)
    event_actions: EventActions[]

    @OneToMany(() => StudentPayments, payment => payment)
    student_payment: StudentPayments[]

    @OneToMany(() => Tasks, tasks => tasks)
    branch_task: Tasks[]

    @OneToMany(() => ForgetPassword, tasks => tasks)
    forget_passwords: ForgetPassword[]

    @OneToMany(() => Leads, leads => leads)
    leads: Leads[]

    @OneToMany(() => DailyTimeColleagues, dailyTime => dailyTime)
    daily_time_colleagues: DailyTimeColleagues[]

    @OneToMany(() => ConnectTime, connectTime => connectTime)
    connect_time: ConnectTime[]
    
    @BeforeInsert()
    async hashPassword() {
        const saltRounds = 10; // You can adjust the salt rounds as per your requirement
        this.employer_password = this.employer_password?.length ? await bcrypt.hash(this.employer_password, saltRounds) : ''
    }

    @BeforeUpdate()
    async hashPasswordBeforeUpdate() {
        if (this.employer_password) {
            // If a password is provided, hash it
            const saltRounds = 10;
            console.log(await bcrypt.hash(this.employer_password, saltRounds));
            
            this.employer_password = await bcrypt.hash(this.employer_password, saltRounds);
        }
    }
}