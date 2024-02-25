import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Regions from "./regions.entity";

@Entity()
export class CompaniesEntity {   
    @PrimaryGeneratedColumn('uuid')
    company_id: string
    
    @Column({ length: 32, nullable: false, unique: true})
    company_name: string
    
    @OneToMany(() => CompanyBranchesEntity, branches => branches)
    branches: CompanyBranchesEntity[]
}

@Entity()
export class CompanyBranchesEntity {
    @PrimaryGeneratedColumn('uuid')
    company_branch_id: string
    
    @Column({ length: 32, unique: true})
    company_branch_phone: string
    
    @Column({ default: true})
    company_branch_status: boolean
    
    @Column({ type: 'numeric', default: 0})
    company_branch_balance: number 
    
    @Column({ type: 'time', default: () => 'CURRENT_TIMESTAMP'})
    company_branch_created: Date
    
    @Column('time')
    company_branch_deleted: Date
    
    @Column()
    company_branch_subdomen: string
    
    @ManyToOne(() => CompaniesEntity, companies => companies.branches)
    companies: CompaniesEntity
    
    @Column()
    branch_company_id: string
    
    @ManyToOne(()=> Regions, regions => regions.region_id)
    regions: Regions
    
    @Column()
    branch_region_id: string
}