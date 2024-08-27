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
import context from './utils/apolloContextUtils'
import apollo from './utils/subscriptions'
const PORT = process.env.PORT || 8080

;(async () => {
    AppDataSource.initialize().then(() => { }).catch((error) => console.log(error))
    const app = express()
    app.use(cors())
    app.use(express.json())
    // app.use(express.static(path.join(__dirname, '../public')));
    app.get('/', (req, res)=> res.send('ok'))
    app.use('/', routes)
    // app.use((req, res, next) => { req.psql = psql; return next(); })
    
    const httpServer = http.createServer(app);
    const onConnect = apollo.onConnect
    const onDisconnect = apollo.onDisconnect
    const subscriptionServer = SubscriptionServer.create(
        { schema: modules, execute, subscribe, onConnect, onDisconnect },
        { server: httpServer, path: '/graphql' }
    )
    const server = new ApolloServer({
        schema: modules,
        context,
        plugins: [
            ApolloServerPluginLandingPageGraphQLPlayground,
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            subscriptionServer.close()
                        }
                    }
                }
            }
        ]
    })

    await server.start();
    server.applyMiddleware({ app });

    httpServer.listen(PORT, () => {
        console.log(`http://localhost:${PORT}${server.graphqlPath}`)
        // console.log(`ws://localhost:${PORT}` + server)
    })
})()
