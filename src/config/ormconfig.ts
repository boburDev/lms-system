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
        path.resolve(__dirname, "..", "entities", "funnel", "*.entity.{ts,js}"),
        path.resolve(__dirname, "..", "entities", "employer", "*.entity.{ts,js}"),
        path.resolve(__dirname, "..", "entities", "options", "*.entity.{ts,js}"),
        path.resolve(__dirname, "..", "entities", "application_usage", "*.entity.{ts,js}"),
        path.resolve(__dirname, "..", "entities", "forms", "*.entity.{ts,js}"),
        path.resolve(__dirname, "..", "entities", "company", "*.entity.{ts,js}")
    ],
    migrations: [],
    logging: false,
    synchronize: true
})
