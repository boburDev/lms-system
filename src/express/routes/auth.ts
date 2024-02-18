import express from'express'
import * as authController from '../controllers/auth'
const router = express.Router();


router
    .post('/login', authController.login)
    .post('/signup', authController.signup)

export default router