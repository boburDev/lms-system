import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "./company/company.entity";
import Employer_Notifications from "./employer/employer-notification.entity";

@Entity()
export default class Notifications {
    @PrimaryGeneratedColumn('uuid')
    notification_id: string

    @Column({ length: 64, nullable: false })
    notification_name: string

    @Column({ length: 256, nullable: false })
    notification_body: string

    @Column({ type: 'int', nullable: false })
    notification_status: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    notification_created: Date

    @Column({ type: 'timestamp', nullable: true })
    notification_deleted: Date

    @Column()
    notification_branch_id: string

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'notification_branch_id' })
    branches: CompanyBranches

    @OneToMany(() => Employer_Notifications, notification => notification)
    employer_notifications: Employer_Notifications[]
}