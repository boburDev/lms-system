import { verify } from "./jwt";
import { pubsub } from "./pubSub";
import AppDataSource from "../config/ormconfig";
import Connect_Time from "../entities/application_usage/connect_time.entity";
import { ConnectionContext } from "../interface/subcribtion";
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
                    // Assuming onlineModel.newConnect() returns a promise resolving to an object with connect_id
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
            console.log((error as Error).message)
            throw new Error("Authorization failed");
        }
    },
    onDisconnect: async (webSocket: WebSocket, context: any) => {
        const data = await context.initPromise;
        console.log(data)
        
        if (data) {
            // Assuming moment is properly used when uncommented
            const startDate = new Date(data.date)
            const endDate = new Date()

            if (data.isUser) {
                // Example logic, assuming onlineModel.updateConnect() and onlineModel.newConnect() are functions
                if (startDate.getTime() != endDate.getTime()) {
                    endDate.setHours(0, 0, 0, 0)
                    // ({ hour: 0, minute: 0, second: 0, millisecond: 0 }).subtract(1, 'millisecond');
                    // await onlineModel.updateConnect(data.connectId, end.valueOf());
                    // await onlineModel.newConnect(data.ID, data.branchID, date);
                } else {
                    // await onlineModel.updateConnect(data.connectId, date);
                }

                // const val = (map.get(data.branchID) ?? 0) - 1;

                // if (val === 0) {
                //     map.delete(data.branchID);
                // } else {
                //     map.set(data.branchID, val);
                // }

                // pubsub.publish('branchOnline', { size: map.size });
            }
        }
    },
};
