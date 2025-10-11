import {PolicyService} from '@/services/policy';
import {Router} from 'express';

const router: Router = Router();

router.get('/', async (req, res) => {
  try {
    const policies = await PolicyService.findByAny({
      where: {},
    });
    res.json({
      policies,
      status: 'success',
      message: 'Policies fetched successfully',
    });
  } catch (error) {
    console.error(error);
    res.json({error: JSON.stringify(error), status: 'error', message: 'Policies fetching failed'});
  }
});

router.post('/', async (req, res) => {
  try {
    const policy = await PolicyService.create(req.body);
    res.json({
      policy,
      status: 'success',
      message: 'Policy created successfully',
    });
  } catch (error) {
    console.error(error);
    res.json({error: JSON.stringify(error), status: 'error', message: 'Policy creation failed'});
  }
});

export default router;
