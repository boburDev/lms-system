import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "./company.entity";
@Entity()
export default class Employers {   
    @PrimaryGeneratedColumn('uuid')
    employer_id: string
    
    @Column({ length: 32, nullable: false})
    employer_name: string
    
    @Column({ length: 32, nullable: false})
    employer_phone: string

    @Column()
    employer_birthday: Date

    @Column({ length: 32, nullable: true })
    employer_gender: string

    @Column({ length: 64 })
    employer_password: string

    @Column({ nullable: false })
    employer_position: number
    
    @Column({ length: 4, default: 'ru' })
    employer_usage_lang: string
    
    @Column({ type: 'time', default: () => 'CURRENT_TIMESTAMP'})
    employer_created: Date
    
    @Column({ type: 'time', nullable: true})
    employer_deleted: Date
    
    @Column()
    employer_branch_id: string

    @ManyToOne(()=> CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'employer_branch_id' })
    branches: CompanyBranches
}