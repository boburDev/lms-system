import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class Prices {
    @PrimaryGeneratedColumn('uuid')
    price_id: string

    @Column({ type: 'int' })
    price: number

    @Column({ type: 'int' })
    from_count: number

    @Column({ type: 'int' })
    to_count: number
}