import express from 'express'
import * as uploadController from '../controllers/uploads'
import { uploadExcel } from '../middlewares/multer'
import { validateJWT } from '../middlewares/validation';
const router = express.Router();

router
    .post('/excel', validateJWT, uploadExcel.single('excelFile'), uploadController.uploadExcel)

export default router