import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "./company/company.entity";

@Entity()
export default class ErrorHandlings {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: true })
    course_branch_id: string

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'course_branch_id' })
    branches: CompanyBranches
}