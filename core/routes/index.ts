import {Router} from 'express';
import summaryRouter from '@/routes/summary';
import policyRouter from '@/routes/policy';
import tagRouter from '@/routes/tag';
import userRouter from '@/routes/user';
import chatRouter from '@/routes/chat';

const router: Router = Router();

router.use('/summary', summaryRouter);
router.use('/policy', policyRouter);
router.use('/tag', tagRouter);
router.use('/user', userRouter);
router.use('/chat', chatRouter);

export default router;
