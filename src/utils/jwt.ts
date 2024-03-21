import jwt from 'jsonwebtoken'
import { TokenData } from '../types/verifyToken'

const secretKey:string = process.env.SECRET_KEY || 'there_is_bad_guy'

// 60sec * 60min * 24hour = 1d   

function sign(payload: any, expireTime: number = 600000) {
    return jwt.sign(payload, secretKey, { expiresIn: expireTime })    
}

function verify(token: string): TokenData | null {
    try {
        const decoded = jwt.verify(token, secretKey) as TokenData;
        return decoded;
    } catch (error) {
        // Если произошла ошибка при верификации токена
        console.error('Token verification error:', error);
        return null;
    }
}
export {
    sign,
    verify
}