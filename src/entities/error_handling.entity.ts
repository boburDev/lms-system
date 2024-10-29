import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "./company/company.entity";

@Entity()
export default class ErrorHandlings {
    @PrimaryGeneratedColumn('uuid')
    error_id: string

    @Column()
    error_type: string

    @Column({ type: "text", nullable: true})
    error_inputs: string
    
    @Column()
    error_message: string

    @Column()
    error_function_name: string

    @Column({ type: "text", nullable: true })
    error_body: string

    @Column({ type: 'int', default: 1 })
    error_status: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    error_created_at: Date

    @Column({ nullable: true})
    error_branch_id: string

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'error_branch_id' })
    branches: CompanyBranches
}