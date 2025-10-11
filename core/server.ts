import cors from 'cors';
import express, {type Application} from 'express';
import router from '@/routes';
import authRouter from '@/routes/auth';
import {setupSwagger} from '@/config/swagger';
import { authMiddleware } from './middleware/auth';

const app: Application = express();

app.use(express.json());
app.use(cors());

setupSwagger(app);

app.use('/api/auth', authRouter);
app.use('/api', authMiddleware, router);


export default app;
