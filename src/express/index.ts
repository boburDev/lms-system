import express from'express'
import authRouter from "./routes/auth";
import uploadRouter from "./routes/uploads";

const router = express.Router();

router.use('/auth', authRouter)
router.use('/upload', uploadRouter)

export default router
