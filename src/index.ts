import express from 'express'
import http from 'http'
import cors from 'cors'
import { ApolloServer } from 'apollo-server-express'
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { execute, subscribe } from 'graphql'
import AppDataSource from "./config/ormconfig";

import dotenv from 'dotenv'
dotenv.config()

import modules from './modules'
import routes from './express'
const PORT = process.env.PORT || 8080 

AppDataSource.initialize().then(() => {}).catch((error) => console.log(error))

;(async () => {
    const app = express()
    app.use(cors())
    app.use(express.json())
    app.use('/', routes)
    // app.use((req, res, next) => { req.psql = psql; return next(); })
    
    const httpServer = http.createServer(app);
    const server = new ApolloServer({
        schema: modules,
        plugins: [
            ApolloServerPluginLandingPageGraphQLPlayground
        ]
    })
    
    await server.start();	
    server.applyMiddleware({ app });
    
    httpServer.listen(PORT, ()=>{
        console.log(`http://localhost:${PORT}${server.graphqlPath}`)
    })
    
})()
