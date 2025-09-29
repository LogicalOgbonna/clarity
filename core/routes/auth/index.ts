import {Router} from 'express';
import signinRouter from '@/routes/auth/signin';
import signupRouter from '@/routes/auth/signup';

const router: Router = Router();

router.use('/signup', signupRouter);
router.use('/signin', signinRouter);

export default router;
