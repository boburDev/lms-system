import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "../company/company.entity";
import Funnel_Columns from "./columns.entity";
import Leads from "./leads.entity";
import { Form_Funnels } from "../form.entity";

@Entity()
export default class Funnels {
    @PrimaryGeneratedColumn('uuid')
    funnel_id: string

    @Column({ length: 64, nullable: false })
    funnel_name: string

    @Column({ type: 'int', default: 1 })
    funnel_status: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    funnel_created: Date

    @Column({ type: 'timestamp', nullable: true })
    funnel_deleted: Date

    @Column()
    funnel_branch_id: string

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'funnel_branch_id' })
    branches: CompanyBranches

    @OneToMany(() => Funnel_Columns, funnel_column => funnel_column.funnels)
    funnel_column: Funnel_Columns[]

    @OneToMany(() => Leads, lead => lead.funnels)
    leads: Leads[]

    @OneToMany(() => Form_Funnels, form_funnel => form_funnel.forms)
    form_funnels: Form_Funnels[]
}