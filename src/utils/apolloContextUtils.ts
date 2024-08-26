import { ApolloError, AuthenticationError } from 'apollo-server-core';
import { authentification } from './authentification';
import { catchErrors } from './global-entities';

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
                } else if (context && !context.isAdmin && !context.isActive && req.body.query.slice(0, 8) === "mutation") {
                    throw new Error(`pay failed`);
                }
                context['error'] = catchErrors
                return context
            } else {
                throw new Error("Token does not exist")
            }
        }
    } catch (error: unknown) {
        let err = (error as Error)
        console.log(err.name)
        
        if (err.message + "" === "auth failed") {
            throw new AuthenticationError("Authentication failed");
        } else if (err.message + "" === "pay failed") {
            throw new ApolloError("Sizning hisobingizdagi mablag' tugadi")
        } else {
            // const errorContext = {
            //     type: err.name,
            //     funcName: "apolloContextUtils",
            //     inputs: "",
            //     message: err.message,
            //     body: err,
            //     branchId: null
            // }
            // catchErrors(errorContext)
            throw new Error(err.message);
        }
    }
}