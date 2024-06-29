import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Funnels from "./funnels.entity";

@Entity()
export default class Funnel_Columns {
    @PrimaryGeneratedColumn('uuid')
    funnel_column_id: string

    @Column({ length: 64, nullable: false })
    funnel_column_name: string

    @Column({ type: 'varchar', length: 32 })
    funnel_column_color: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    funnel_column_created: Date

    @Column({ type: 'timestamp', nullable: true })
    funnel_column_deleted: Date

    @Column()
    funnel_id: string

    @ManyToOne(() => Funnels, funnel => funnel)
    @JoinColumn({ name: 'funnel_id' })
    funnels: Funnels
}