import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Countries from './country.entity'
import { CompanyBranches } from "./company.entity";

@Entity()
export default class Regions {
    @PrimaryGeneratedColumn('uuid')
    region_id: string

    @Column({ length: 64, nullable: false})
    region_name: string

    @Column()
    country_id: string

    @ManyToOne(()=> Countries, country => country.country_id)
    @JoinColumn({ name: 'country_id'})
    countries: Countries

    @OneToMany(() => CompanyBranches, branches => branches)
    branches: CompanyBranches[]
}