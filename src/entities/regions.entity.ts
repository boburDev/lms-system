import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Countries from './country.entity'

@Entity()
export default class Regions {
    @PrimaryGeneratedColumn('uuid')
    region_id: string

    @Column({ length: 64, nullable: false})
    region_name: string

    @Column()
    country_id: string
    
    @ManyToOne(()=> Countries, country => country.regions)
    @JoinColumn({ name: 'category_id'})
    countries: Countries
 
}