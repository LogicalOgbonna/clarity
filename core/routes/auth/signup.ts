import AuthService from '@/services/auth';
import {Router} from 'express';
import {AuthDto} from '@/db/dto/auth';

const router: Router = Router();

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User sign up
 *     description: Create a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               browserId:
 *                 type: string
 *                 description: User ID
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               password:
 *                 type: string
 *                 description: User password
 *                 minLength: 6
 *               name:
 *                 type: string
 *                 description: User full name
 *             required:
 *               - browserId
 *               - email
 *               - password
 *               - name
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     browserId:
 *                       type: string
 *                     browserId:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - validation error or user already exists
 */
router.post('/', async (req, res) => {
  try {
    const {browserId, email, password, name} = AuthDto.signupDto.parse(req.body);
    const user = await AuthService.signup({browserId, email, password, name});
    res.json(user);
  } catch (error) {
    res.status(500).json({error: 'Internal server error'});
  }
});

export default router;
