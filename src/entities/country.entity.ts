import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Regions from './regions.entity'
@Entity()
export default class Countries {   
    @PrimaryGeneratedColumn('uuid')
    country_id: string

    @Column({ length: 64, nullable: false, unique: true})
    country_name: string

    @OneToMany(() => Regions, (regions) => regions)
    regions: Regions[]
}