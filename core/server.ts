import cors from 'cors';
import express, {type Application} from 'express';
import router from '@/routes';
import authRouter from '@/routes/auth';
import {setupSwagger} from '@/config/swagger';

const app: Application = express();

app.use(express.json());
app.use(cors());

setupSwagger(app);

app.use('/api', router);

app.use('/api/auth', authRouter);

export default app;
