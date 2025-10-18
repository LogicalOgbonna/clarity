import {UserService} from '@/services/user';
import {UserDto} from '@/db/dto/user';
import {Router} from 'express';
import {ZodError} from 'zod';
import { CoreError } from '@/utils/error';

const router: Router = Router();

// GET /api/user/by-browser/:browserId - Get user by browser ID
router.get('/browser/:browserId', async (req, res) => {
  try {
    const {browserId} = UserDto.findByBrowserIdDto.parse(req.params);

    const {password, ...user} = await UserService.findByBrowserId({browserId});

    res.json({
      user,
      status: 'success',
      message: 'User found successfully',
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      const error = new CoreError('bad_request:api', err?.message ?? err?.cause, 'Validation error').toResponse();
      return res.status(error.statusCode).json({...error, details: err.issues});
    }
    const error = new CoreError(
      'bad_request:api',
      err?.message ?? err?.cause,
      'An error occurred while finding the user by browser ID'
    ).toResponse();
    res.status(error.statusCode).json(error);
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
    } catch (err: any) {
    if (err instanceof ZodError) {
      const error = new CoreError('bad_request:api', err?.message ?? err?.cause, 'Validation error').toResponse();
      return res.status(error.statusCode).json({...error, details: err.issues});
    }
    const error = new CoreError(
      'bad_request:api',
      err?.message ?? err?.cause,
      'An error occurred while finding the user by ID'
    ).toResponse();
    res.status(error.statusCode).json(error);
  }
});

// PUT /api/user/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    const {id} = UserDto.idDto.parse(req.params);
    const updateData = UserDto.updateUserDto.parse(req.body);

    // filter out undefined values
    const filteredData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    ) as any;

    const user = await UserService.update({id}, filteredData);

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
  } catch (err: any) {
    if (err instanceof ZodError) {
      const error = new CoreError('bad_request:api', err?.message ?? err?.cause, 'Validation error').toResponse();
      return res.status(error.statusCode).json({...error, details: err.issues});
    }
    const error = new CoreError(
      'bad_request:api',
      err?.message ?? err?.cause,
      'An error occurred while updating the user'
    ).toResponse();
    res.status(error.statusCode).json(error);
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
  } catch (err: any) {
    if (err instanceof ZodError) {
      const error = new CoreError('bad_request:api', err?.message ?? err?.cause, 'Validation error').toResponse();
      return res.status(error.statusCode).json({...error, details: err.issues});
    }
    const error = new CoreError(
      'bad_request:api',
      err?.message ?? err?.cause,
      'An error occurred while deleting the user'
    ).toResponse();
    res.status(error.statusCode).json(error);
  }
});

export default router;
