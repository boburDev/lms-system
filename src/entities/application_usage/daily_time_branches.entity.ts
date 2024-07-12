import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "../company/company.entity";

@Entity()
export default class Daily_Time_Branches {
    @PrimaryGeneratedColumn('uuid')
    daily_time_branch_id: string

    @Column({ type: 'int' })
    online_time: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    online_date: Date

    @Column()
    branch_id: string

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'branch_id' })
    branches: CompanyBranches
}