import {AuthDto} from '@/db/dto/auth';
import AuthService from '@/services/auth';
import {Router} from 'express';

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
  } catch (error) {
    res.status(500).json({error, status: 'error', message: 'User sign in failed'});
  }
});

export default router;
