import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class Phone {
    @PrimaryGeneratedColumn('uuid')
    phone_id: string

    @Column({ length: 12 })
    phone_number: string

    @Column({ type: 'int' })
    temp_code: number

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP + interval '2 minutes'" })
    phone_code_created: Date
}