import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class Admin {
    @PrimaryGeneratedColumn('uuid')
    admin_id: string

    @Column({ length: 32, unique: true })
    admin_username: string

    @Column({ length: 16 })
    admin_name: string

    @Column({ length: 16 })
    admin_lastname: string

    @Column({ length: 16 })
    admin_phone: string

    @Column({ length: 64 })
    admin_password: string

    @Column({ type: 'int', default: 2 })
    admin_role: number

    @Column({ type: 'int', default: 1 })
    admin_status: number
}