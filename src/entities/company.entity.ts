import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Regions from "./regions.entity";
import Employers from "./employers.entity";
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
    branch_region_id: string

    @ManyToOne(()=> Regions, regions => regions.region_id)
    @JoinColumn({ name: "branch_region_id" })
    regions: Regions

    @OneToMany(() => Employers, employers => employers)
    branches: Employers[]
}