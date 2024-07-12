import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Employers from "../employer/employers.entity";

@Entity()
export default class Daily_Time_Colleagues {
    @PrimaryGeneratedColumn('uuid')
    daily_time_colleague_id: string

    @Column({ type: 'int' })
    online_time: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    connect_time_created: Date

    @Column()
    colleague_id: string

    @ManyToOne(type => Employers, employer => employer)
    @JoinColumn({ name: 'colleague_id' })
    employer: Employers;
}