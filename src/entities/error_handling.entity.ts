import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "./company/company.entity";

@Entity()
export default class ErrorHandlings {
    @PrimaryGeneratedColumn('uuid')
    error_id: string

    @Column()
    error_type: string

    @Column()
    error_inputs: string
    
    @Column()
    error_message: string

    @Column()
    error_function_name: string

    @Column()
    error_body: string

    @Column({ nullable: true})
    error_branch_id?: string

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'error_branch_id' })
    branches: CompanyBranches
}