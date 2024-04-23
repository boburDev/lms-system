import { TokenData } from '../types/verifyToken'
import { verify } from './jwt'
export const context = async ({ req }: any) => {
    try {
        const { access_token } = req.headers

        if (!access_token) {
            return ''
        } else {
            const tokenDate = verify(access_token)
            if (!tokenDate) {
                throw new Error("Invalid token")
            }
            return tokenDate
        }
            
        
    } catch (error: unknown) {
        let message = (error as Error).message
        // if (message === 'No token') {
        // } else if (false) {
            
        // } else {
        // }
        throw new Error(message)
    }


}