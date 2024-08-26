import multer, { FileFilterCallback, StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';

const excel = ['.xlsx', '.xls']
const photo = ['.jpg', '.jpeg', '.png']

const storage: StorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            let uploadPath = './public'
            const type = String(req.headers.type)

            if (file.fieldname == 'photoFile' && type == 'form') {
                uploadPath += '/forms'
            } else if (file.fieldname == 'photoFile' && type == 'colleague') {
                uploadPath += '/employers'
            } else if (file.fieldname == 'excelFile' && ['student', 'colleague', 'lead'].includes(type)) {
                uploadPath += '/uploads'
            } else {
                throw new Error("Invalid Type or fieldName");
            }

            // Check if the uploads directory exists, if not, create it
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }

            cb(null, uploadPath);
        } catch (error) {
            console.log(error);
        }
    },
    filename: (req, file, cb) => {
        try {
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        } catch (error) {
            console.log(error);
        }
    },
});

export const uploadExcel = multer({
    storage: storage,
    fileFilter: (req, file: Express.Multer.File, cb: FileFilterCallback) => {
        try {
            const extname = path.extname(file.originalname).toLowerCase()
            const mimetype = file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.mimetype === 'application/vnd.ms-excel';
            const excelCon = mimetype && excel.includes(extname) && file.fieldname == 'excelFile'
            const photoCon = photo.includes(extname) && file.fieldname == 'photoFile'
            if (excelCon || photoCon) {
                cb(null, true);
            } else {
                cb(new Error('Error: Excel or Photo Files Only!'));
            }
        } catch (error) {
            console.log(error);
        }
    },
});
