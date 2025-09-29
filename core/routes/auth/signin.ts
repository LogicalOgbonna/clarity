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
router.post('/', (req, res) => {
  res.send('Hello World');
});

/**
 * @swagger
 * /api/auth/signin:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get signin page
 *     description: Get the signin page (if you have a web interface)
 *     responses:
 *       200:
 *         description: Signin page
 */
router.get('/', (req, res) => {
  res.send('Hello World');
});

export default router;
