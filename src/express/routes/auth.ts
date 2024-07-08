import express from'express'
import * as authController from '../controllers/auth'
import * as authAdminController from '../controllers/admin'
const router = express.Router();


router
    .post('/login', authController.login)
    .post('/signup', authController.signup)
    .post('/create-admin', authAdminController.create)
    .post('/admin', authAdminController.login)

export default router