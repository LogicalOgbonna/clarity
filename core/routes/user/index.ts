import {UserService} from '@/services/user';
import {UserDto} from '@/db/dto/user';
import {Router} from 'express';
import {ZodError} from 'zod';

const router: Router = Router();

// POST /api/user/browser - Register or get user by browser ID (for extension installation)
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

// GET /api/user/by-browser/:browserId - Get user by browser ID
router.get('/browser/:browserId', async (req, res) => {
  try {
    const {browserId} = UserDto.findByBrowserIdDto.parse(req.params);

    const user = await UserService.findByBrowserId({browserId});

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        status: 'error',
        message: 'No user found with this browser ID',
      });
    }

    res.json({
      user: {
        id: user.id,
        browserId: user.browserId,
        name: user.name,
        email: user.email,
        numberOfSummaries: user.numberOfSummaries,
        createdAt: user.createdAt,
      },
      status: 'success',
      message: 'User found successfully',
    });
  } catch (error) {
    console.error('Error finding user by browser ID:', error);
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
      message: 'Failed to find user',
    });
  }
});

// GET /api/user/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const {id} = UserDto.idDto.parse(req.params);

    const user = await UserService.findByID({id});

    res.json({
      user: {
        id: user.id,
        browserId: user.browserId,
        name: user.name,
        email: user.email,
        numberOfSummaries: user.numberOfSummaries,
        createdAt: user.createdAt,
      },
      status: 'success',
      message: 'User found successfully',
    });
  } catch (error) {
    console.error('Error finding user by ID:', error);
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
      message: 'Failed to find user',
    });
  }
});

// PUT /api/user/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    const {id} = UserDto.idDto.parse(req.params);
    const updateData = UserDto.updateUserDto.parse(req.body);

    const user = await UserService.update({id}, updateData);

    res.json({
      user: {
        id: user.id,
        browserId: user.browserId,
        name: user.name,
        email: user.email,
        numberOfSummaries: user.numberOfSummaries,
        createdAt: user.createdAt,
      },
      status: 'success',
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
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
      message: 'User update failed',
    });
  }
});

// DELETE /api/user/:id - Delete user
router.delete('/:id', async (req, res) => {
  try {
    const {id} = UserDto.idDto.parse(req.params);

    await UserService.delete({id});

    res.json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
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
      message: 'User deletion failed',
    });
  }
});

export default router;
