import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "../company/company.entity";
import FunnelColumns from "./columns.entity";
import Leads from "./leads.entity";
import { FormFunnels } from "../form.entity";

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

    @OneToMany(() => FunnelColumns, funnel_column => funnel_column.funnels)
    funnel_column: FunnelColumns[]

    @OneToMany(() => Leads, lead => lead.funnels)
    leads: Leads[]

    @OneToMany(() => FormFunnels, form_funnel => form_funnel.forms)
    form_funnels: FormFunnels[]
}