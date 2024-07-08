import { Request, Response } from 'express'
import AppDataSource from '../../config/ormconfig'

export const login = async (req: Request, res: Response) => {
    const { username, name, lastname, phone, role, password } = req.body
    res.json({ error: null })
}

export const create = async (req: Request, res: Response) => {
    const { username, name, lastname, phone, role, password } = req.body
    res.json({ error: null })
}