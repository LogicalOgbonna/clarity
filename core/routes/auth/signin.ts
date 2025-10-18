import {AuthDto} from '@/db/dto/auth';
import AuthService from '@/services/auth';
import {CoreError} from '@/utils/error';
import {Router} from 'express';
import {ZodError} from 'zod';

const router: Router = Router();

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User sign in
 *     description: Authenticate a user with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               password:
 *                 type: string
 *                 description: User password
 *                 minLength: 6
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       400:
 *         description: Bad request - missing required fields
 */

router.post('/', async (req, res) => {
  try {
    const payload = AuthDto.signinDto.parse(req.body);
    const {
      user: {password, ...user},
      token,
    } = await AuthService.signin(payload);
    res.json({user, token});
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const k = new CoreError('bad_request:auth', 'Validation error').toResponse();
      res.status(k.statusCode).json(k);
    }
    const k = new CoreError('bad_request:auth', (error as Error)?.message ?? 'Invalid credentials', 'Please check your email and password and try again.').toResponse();
    res.status(k.statusCode).json(k);
  }
});

export default router;
