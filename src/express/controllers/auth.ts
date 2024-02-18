import { Request, Response } from 'express'
import { sign } from '../../utils/jwt'
import { validateObjectSignup } from '../../utils/validation'

export const login = async (req:Request, res: Response) => {
    try {
        const { username, password } = req.body
        
        console.log(username, password)

        res.json({data: 'success'})
    } catch (error) {
        console.log('Login error:', error)
    }
}

export const signup = async (req:Request, res: Response) => {
    try {
        const { error, value } = validateObjectSignup(req.body)

        if (error?.message) throw new Error(error.message);
        
        console.log(value)
        
        res.json({data: 'success'})
    } catch (error) {
        console.log(error)
    }
}
