import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import bcrypt from 'bcrypt';

@Entity()
export default class Admin {
    @PrimaryGeneratedColumn('uuid')
    admin_id: string

    @Column({ length: 32, unique: true })
    admin_username: string

    @Column({ length: 32 })
    admin_name: string

    @Column({ length: 32 })
    admin_lastname: string

    @Column({ length: 16, unique: true })
    admin_phone: string

    @Column({ length: 64 })
    admin_password: string

    @Column({ type: 'int', default: 2 })
    admin_role: number

    @Column({ type: 'int', default: 1 })
    admin_status: number

    @BeforeInsert()
    async hashPassword() {
        const saltRounds = 10; // You can adjust the salt rounds as per your requirement
        this.admin_password =  await bcrypt.hash(this.admin_password, saltRounds)
    }
}