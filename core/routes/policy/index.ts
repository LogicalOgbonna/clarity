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
    res.json({error, status: 'error', message: 'Policies fetching failed'});
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
    res.json({error, status: 'error', message: 'Policy creation failed'});
  }
});

router.get('/count', async (req, res) => {
  try {
    const privacy = await PolicyService.policyCount({where: {type: 'privacy'}});
    const terms = await PolicyService.policyCount({where: {type: 'terms'}});
    res.json({privacy, terms, status: 'success', message: 'count fetched successfully'});
  } catch (error) {
    console.error(error);
    res.json({error, status: 'error', message: 'count fetching failed'});
  }
});
export default router;
