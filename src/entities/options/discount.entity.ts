import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class Discounts {
    @PrimaryGeneratedColumn('uuid')
    discount_id: string

    @Column({ type: 'int' })
    discount_term: number

    @Column({ type: 'int' })
    discount_percentage: number
}