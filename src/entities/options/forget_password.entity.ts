import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "../company.entity";
import Employers from "../employer/employers.entity";

@Entity()
export default class Forget_Password {
    @Column({ type: 'int' })
    sended_code: number

    @PrimaryGeneratedColumn('uuid')
    sender_id: string

    @CreateDateColumn({ type: 'timestamptz', default: () => "CURRENT_TIMESTAMP + interval '2 minutes'" })
    created_at: Date;

    @ManyToOne(() => Employers, employer => employer.forget_passwords)
    employers: Employers
}