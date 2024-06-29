import "reflect-metadata"
import path from 'path'
import { DataSource } from 'typeorm'

export default new DataSource({
    type:"postgres",
    host: "localhost",
    password: "bobur1907",
    port: 5432,
    username: "postgres",
    database: "crm",
    entities: [
        path.resolve(__dirname, "..", "entities", "*.entity.{ts,js}"),
        path.resolve(__dirname, "..", "entities", "student", "*.entity.{ts,js}"),
        path.resolve(__dirname, "..", "entities", "group", "*.entity.{ts,js}"),
        path.resolve(__dirname, "..", "entities", "funnels", "*.entity.{ts,js}")
    ],
    migrations: [],
    logging: true,
    synchronize: true
})
