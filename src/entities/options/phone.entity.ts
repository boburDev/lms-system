import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class Phone {
    @PrimaryGeneratedColumn('uuid')
    phone_id: string

    @Column({ length: 12 })
    phone_number: string

    @Column({ length: 6 })
    temp_code: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    phone_code_created: Date
}