import { ApolloError, AuthenticationError } from 'apollo-server-core';
import { authentification } from './authentification';

export default async ({ req, connection }: any) => {
    try {
        if (connection) {
            return connection.context;
        } else {
            const { token } = req.headers
            if (token) {
                let context: any = await authentification(token)
                if (!context) {
                    throw new Error("auth failed");
                } else if (context && context.isAdmin && !context.isActive && req.body.query.slice(0, 8) === "mutation") {
                    throw new Error(`pay failed`);
                }
                return context
            } else {
                throw new Error("Token does not exist")
            }
        }
    } catch (error: unknown) {
        let message = (error as Error).message
        if (message + "" === "auth failed") {
            throw new AuthenticationError("Authentication failed");
        } else if (message + "" === "pay failed") {
            throw new ApolloError("Sizning hisobingizdagi mablag' tugadi")
        } else {
            throw new Error(message);
        }
    }
}