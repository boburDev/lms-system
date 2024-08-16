import { verify } from "./jwt";
import { pubsub } from "./pubSub";
import AppDataSource from "../config/ormconfig";
import Connect_Time from "../entities/application_usage/connect_time.entity";
import { ConnectionContext } from "../interfaces/subcribtion";

const map = new Map<string, number>();

export default {
    onConnect: async (connectionParams: { token?: string }, webSocket: WebSocket, context: any) => {
        try {
            if (connectionParams && connectionParams.token) {
                const tokenData: any = verify(connectionParams.token);
                if (!tokenData) throw new Error("Invalid access token!");
                
                const isUser: boolean = !!tokenData.branchId;
                let connectId: string | undefined;
                const date: number = Date.now();
                
                if (isUser) {
                    const connectRepository = AppDataSource.getRepository(Connect_Time)
                    let newConnect = new Connect_Time()
                    newConnect.branch_id = tokenData.branchId
                    newConnect.colleague_id = tokenData.colleagueId
                    newConnect.connect_time = Date.now()
                    const newConnection = await connectRepository.save(newConnect);
                    connectId = newConnection.connect_id;

                    const val = map.get(tokenData.branchId) ?? 0;
                    map.set(tokenData.branchId, val + 1);
                }

                pubsub.publish('branchOnline', { size: map.size, hello: "Hello" });
                let returnData = {
                    authorization: connectionParams.token,
                    isUser,
                    connectId,
                    colleagueId: tokenData.colleagueId,
                    date,
                    branchId: tokenData.branchId
                } as ConnectionContext;
                return returnData
            } else {
                throw new Error("Not exist access token!");
            }
        } catch (error) {
            console.log((error as Error).message);
            throw new Error("Authorization failed 1");
        }
    },
    onDisconnect: async (webSocket: WebSocket, context: any) => {
        try {
            const data = (await context.initPromise);
            if (data) {
                const startDate = new Date(data.date)
                const endDate = new Date()

                if (data.isUser) {
                    const connectRepository = AppDataSource.getRepository(Connect_Time)
                    let connection = await connectRepository.createQueryBuilder("connect_time")
                        .where("connect_time.connect_id = :Id", { Id: data.connectId })
                        .getOne();
                    if (!connection) throw new Error("connection time not found");
                    if (startDate.getDate() != endDate.getDate()) {
                        endDate.setHours(0, 0, 0, 0)
                        let newDate = new Date(endDate.getTime() - 1) // 1 milliseconds
                        connection.disconnect_time = newDate.getTime()
                        await connectRepository.save(connection)
                        let newConnect = new Connect_Time()
                        newConnect.branch_id = data.branchId
                        newConnect.colleague_id = data.colleagueId
                        newConnect.connect_time = Date.now()
                        await connectRepository.save(newConnect);
                    } else {
                        connection.disconnect_time = endDate.getTime()
                        await connectRepository.save(connection)
                    }

                    const branchId = data.branchId;
                    const val = (map.get(branchId) ?? 0) - 1;

                    if (val === 0) {
                        map.delete(branchId);
                    } else {
                        map.set(branchId, val);
                    }

                    pubsub.publish('branchOnline', { size: map.size });
                }
            }
        } catch (error) {
            console.log((error as Error).message);
            throw new Error("Authorization failed 2");
        }
    }
};
