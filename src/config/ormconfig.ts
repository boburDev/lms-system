import path from 'path'
import { DataSource } from 'typeorm'

const AppDataSource = new DataSource({
    type:"postgres",
    host: "localhost",
    password: "bobur1907",
    port: 5432,
    username: "postgres",
    database: "crm",
    entities: [
        path.resolve(__dirname, "..", "entities", "*.entities.{ts,js}")
    ],
    // migrations: [
    //     path.resolve(__dirname, "..", "migrations", "**/*.{ts,js}")
    // ],
    logging: true,
    synchronize: true
})

export{ AppDataSource }
