import AuthService from '@/services/auth';
import {Router} from 'express';
import {AuthDto} from '@/db/dto/auth';
import { ZodError } from 'zod';
import { UserDto } from '@/db/dto/user';
import { UserService } from '@/services/user';

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
    const user = await AuthService.signup({browserId, email: email.trim().toLowerCase(), password, name});
    res.json(user);
  } catch (error) {
    res.status(500).json({error: 'Internal server error'});
  }
});


router.post('/browser', async (req, res) => {
  try {
    const {browserId, name, email} = UserDto.createUserDto.parse(req.body);

    const user = await UserService.createOrGetByBrowserId(browserId, name, email);

    res.json({
      user: {
        id: user.id,
        browserId: user.browserId,
        numberOfSummaries: user.numberOfSummaries,
      },
      status: 'success',
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Error registering user:', error);
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.issues,
        status: 'error',
        message: 'Invalid request data',
      });
    }
    res.status(500).json({
      error: 'Internal server error',
      status: 'error',
      message: 'User registration failed',
    });
  }
});
export default router;
