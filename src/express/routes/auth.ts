import express from'express'
import * as authController from '../controllers/auth'
import * as authAdminController from '../controllers/admin'
const router = express.Router();

router
    .post('/site-login', authController.login)
    .post('/login', authController.loginBySubdomain)
    .post('/verify-phone', authController.verifyPhoneBeforeCreateAccaunt)
    .post('/signup', authController.signup)
    .post('/forget-password', authController.forgetPassword)
    .post('/update-password', authController.updateNewPassword)
    .post('/create-admin', authAdminController.create)
    .post('/login-admin', authAdminController.login)

export default router