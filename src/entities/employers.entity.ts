import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class EmployersEntity {   
    @PrimaryGeneratedColumn('uuid')
    employer_id: string
    
    @Column({ length: 32, nullable: false})
    employer_name: string
    
    @Column({ length: 32, nullable: false})
    employer_phone: string

    @Column()
    employer_birthday: Date

    @Column({ length: 32 })
    employer_gender: string

    @Column({ length: 64 })
    employer_password: string

    @Column({ nullable: false })
    employer_position: number
    
    @Column({ length: 4 })
    employer_usage_lang: string
    
    @Column({ type: 'time', default: () => 'CURRENT_TIMESTAMP'})
    employer_created: Date
    
    @Column('time')
    employer_deleted: Date

    
}