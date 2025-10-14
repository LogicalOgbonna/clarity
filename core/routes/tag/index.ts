import {TagService} from '@/services/tag';
import {Router} from 'express';

const router: Router = Router();

router.get('/', async (req, res) => {
  try {
    const tags = await TagService.findByAny({});
    res.json({
      tags,
      status: 'success',
      message: 'Tags fetched successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({error, status: 'error', message: 'Tags fetching failed'});
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
  } catch (error) {
    console.error(error);
    res.status(500).json({error, status: 'error', message: 'Tag creation failed'});
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
  } catch (error) {
    console.error('Error in create-or-get-ids:', error);
    res.status(500).json({
      error,
      status: 'error',
      message: 'Tag ID creation/retrieval failed',
    });
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
  } catch (error) {
    console.error(error);
    res.status(500).json({error, status: 'error', message: 'Tag fetching failed'});
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
  } catch (error) {
    console.error(error);
    res.status(500).json({error, status: 'error', message: 'Tag update failed'});
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
  } catch (error) {
    console.error(error);
    res.status(500).json({error, status: 'error', message: 'Tag deletion failed'});
  }
});

export default router;
