import express, { Request, Response } from'express'

const router = express.Router();

router
    .post('/login', (req: Request, res: Response) => {
        const { username, password } = req.body
        console.log(username, password)
        res.send('success')
    })

export default router