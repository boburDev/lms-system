import { NextFunction, Request, Response } from 'express'
import { verify } from '../../utils/jwt';
import { TokenData } from '../../types/verifyToken';

declare module 'express-serve-static-core' {
    interface Request {
        user?: string | TokenData;
    }
}

// JWT validation middleware
export const validateJWT = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.headers;
        if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
        let tokenDate: TokenData | null = verify(String(token));
        if (!tokenDate) throw new Error("Invalid token.");
        req.user = tokenDate
        next(); // Allow the request to proceed
    } catch (err) {
        return res.status(400).json({ message: 'Invalid token.', error: true });
    }
};