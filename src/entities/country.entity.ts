import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CountryEntity {
    @PrimaryGeneratedColumn('uuid')
    id:string
}