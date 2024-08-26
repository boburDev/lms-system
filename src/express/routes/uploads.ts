import express from 'express'
import * as uploadController from '../controllers/uploads_and_downloads'
import { uploadExcel } from '../middlewares/multer'
import { validateJWT } from '../middlewares/validation';
const router = express.Router();

router
    .post('/excel', validateJWT, uploadExcel.single('excelFile'), uploadController.uploadExcel)
    .post('/photos', validateJWT, uploadExcel.single('photoFile'), uploadController.uploadPhotos)
    .get('/excel', validateJWT, uploadController.downloadExcel)
    .get('/photos', validateJWT, uploadController.downloadPhotos)
export default router
