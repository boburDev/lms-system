import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Funnels from "./funnels.entity";
import Leads from "./leads.entity";

@Entity()
export default class Funnel_Columns {
    @PrimaryGeneratedColumn('uuid')
    funnel_column_id: string

    @Column({ length: 64, nullable: false })
    funnel_column_name: string

    @Column({ type: 'varchar', length: 32 })
    funnel_column_color: string

    @Column({ type: 'int', default: 1 })
    funnel_column_order: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    funnel_column_created: Date

    @Column({ type: 'timestamp', nullable: true })
    funnel_column_deleted: Date

    @Column()
    funnel_id: string

    @ManyToOne(() => Funnels, funnel => funnel.funnel_columns)
    @JoinColumn({ name: 'funnel_id' })
    funnels: Funnels

    @OneToMany(() => Leads, lead => lead.lead_id)
    leads: Leads[]
}


// @Entity()
// class Orders {
//     @PrimaryGeneratedColumn('uuid')
//     order_id: string

//     @Column({ length: 64, nullable: false })
//     order_name: string

//     @Column({ type: 'int', default: 1 })
//     order_number: number
// }