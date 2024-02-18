import jwt, { JwtPayload } from 'jsonwebtoken'

const secretKey:string = process.env.SECRET_KEY || 'there_is_bad _uy'

// 60sec * 60min * 24hour = 1d   
const sign = (payload: JwtPayload, expireTime:number = 60) => jwt.sign(payload, secretKey, { expiresIn: expireTime })
const verify = (token: string) => jwt.verify(token, secretKey)

export {
    sign,
    verify
}