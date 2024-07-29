import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Notifications from "../notification.entity";

@Entity()
export default class Employer_Notifications {
    @PrimaryGeneratedColumn('uuid')
    employer_notification_id: string

    @Column({ type: 'boolean', nullable: true, default: false })
    notification_status_is_read: boolean

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    notification_created: Date

    @Column({ type: 'timestamp', nullable: true })
    notification_deleted: Date

    @Column()
    notification__id: string

    @ManyToOne(() => Notifications, notification => notification.notification_id)
    @JoinColumn({ name: 'notification_id' })
    branches: Notifications
}