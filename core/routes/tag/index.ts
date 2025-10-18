import {TagService} from '@/services/tag';
import {Router} from 'express';
import {CoreError} from '@/utils/error';
import {ZodError} from 'zod';

const router: Router = Router();

router.get('/', async (req, res) => {
  try {
    const tags = await TagService.findByAny({});
    res.json({
      tags,
      status: 'success',
      message: 'Tags fetched successfully',
    });
  } catch (err: any) {
    const error = new CoreError(
      'bad_request:api',
      err?.message ?? err?.cause,
      'An error occurred while fetching the tags'
    ).toResponse();
    res.status(error.statusCode).json(error);
  }
});

router.post('/', async (req, res) => {
  try {
    const tag = await TagService.create(req.body);
    res.json({
      tag,
      status: 'success',
      message: 'Tag created successfully',
    });
  } catch (err: any) {
    const error = new CoreError(
      'bad_request:api',
      err?.message ?? err?.cause,
      'An error occurred while creating the tag'
    ).toResponse();
    res.status(error.statusCode).json(error);
  }
});

router.post('/create-or-get-ids', async (req, res) => {
  try {
    const {tagNames} = req.body;

    if (!tagNames || !Array.isArray(tagNames)) {
      return res.status(400).json({
        error: 'Missing or invalid tagNames',
        status: 'error',
        message: 'tagNames must be an array of strings',
      });
    }

    const tagIds = await TagService.createOrGetTagIds(tagNames);

    res.json({
      tagIds,
      status: 'success',
      message: 'Tag IDs retrieved/created successfully',
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      const error = new CoreError('bad_request:api', err?.message ?? err?.cause, 'Validation error').toResponse();
      return res.status(error.statusCode).json({...error, details: err.issues});
    }
    const error = new CoreError(
      'bad_request:api',
      err?.message ?? err?.cause,
      'An error occurred while creating or getting tag IDs'
    ).toResponse();
    res.status(error.statusCode).json(error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tag = await TagService.findByID({id: parseInt(req.params.id)});
    res.json({
      tag,
      status: 'success',
      message: 'Tag fetched successfully',
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      const error = new CoreError('bad_request:api', err?.message ?? err?.cause, 'Validation error').toResponse();
      return res.status(error.statusCode).json({...error, details: err.issues});
    }
    const error = new CoreError(
      'bad_request:api',
      err?.message ?? err?.cause,
      'An error occurred while fetching the tag'
    ).toResponse();
    res.status(error.statusCode).json(error);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const tag = await TagService.update({id: parseInt(req.params.id)}, req.body);
    res.json({
      tag,
      status: 'success',
      message: 'Tag updated successfully',
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      const error = new CoreError('bad_request:api', err?.message ?? err?.cause, 'Validation error').toResponse();
      return res.status(error.statusCode).json({...error, details: err.issues});
    }
    const error = new CoreError(
      'bad_request:api',
      err?.message ?? err?.cause,
      'An error occurred while updating the tag'
    ).toResponse();
    res.status(error.statusCode).json(error);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const tag = await TagService.delete({id: parseInt(req.params.id)});
    res.json({
      tag,
      status: 'success',
      message: 'Tag deleted successfully',
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      const error = new CoreError('bad_request:api', err?.message ?? err?.cause, 'Validation error').toResponse();
      return res.status(error.statusCode).json({...error, details: err.issues});
    }
    const error = new CoreError(
      'bad_request:api',
      err?.message ?? err?.cause,
      'An error occurred while deleting the tag'
    ).toResponse();
    res.status(error.statusCode).json(error);
  }
});

export default router;
