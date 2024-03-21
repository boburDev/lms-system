import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "./company.entity";

@Entity()
export default class Rooms {
    @PrimaryGeneratedColumn('uuid')
    room_id: string

    @Column({ length: 64, nullable: false, unique: true })
    room_name: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    room_created: Date

    @Column({ type: 'timestamp', nullable: true })
    room_deleted: Date

    @Column()
    room_branch_id: string

    @ManyToOne(() => CompanyBranches, branch => branch.company_branch_id)
    @JoinColumn({ name: 'room_branch_id' })
    branches: CompanyBranches
}