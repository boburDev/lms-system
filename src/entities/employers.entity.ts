import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "./company.entity";
import bcrypt from 'bcrypt';
import Groups from "./groups.entity";
import Student_payments from "./student_payments.entity";

@Entity()
export default class Employers {   
    @PrimaryGeneratedColumn('uuid')
    employer_id: string
    
    @Column({ length: 32, nullable: false})
    employer_name: string
    
    @Column({ length: 32, nullable: false})
    employer_phone: string

    @Column({ nullable: true })
    employer_birthday: Date

    @Column({ length: 32, nullable: true })
    employer_gender: string

    @Column({ length: 64, nullable: true })
    employer_password: string

    @Column({ nullable: false })
    employer_position: number
    
    @Column({ length: 4, default: 'ru' })
    employer_usage_lang: string
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    employer_created: Date
    
    @Column({ type: 'timestamp', nullable: true})
    employer_deleted: Date
    
    @Column()
    employer_branch_id: string

    @ManyToOne(()=> CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'employer_branch_id' })
    branches: CompanyBranches

    @OneToMany(type => Groups, group => group.group_id)
    group: Groups[];

    @OneToMany(() => Student_payments, payment => payment)
    student_payment: Student_payments[]
    
    @BeforeInsert()
    async hashPassword() {
        const saltRounds = 10; // You can adjust the salt rounds as per your requirement
        this.employer_password = this.employer_password.length ? await bcrypt.hash(this.employer_password, saltRounds) : ''
    }
}