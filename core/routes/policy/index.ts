import {PolicyService} from '@/services/policy';
import {CoreError} from '@/utils/error';
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
  } catch (err: any) {
    const error = new CoreError(
      'bad_request:api',
      err?.message ?? err?.cause,
      'An error occurred while fetching the policies'
    ).toResponse();
    res.status(error.statusCode).json(error);
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
  } catch (err: any) {
    const error = new CoreError(
      'bad_request:api',
      err?.message ?? err?.cause,
      'An error occurred while creating the policy'
    ).toResponse();
    res.status(error.statusCode).json(error);
  }
});

router.get('/count', async (req, res) => {
  try {
    const privacy = await PolicyService.policyCount({where: {type: 'privacy'}});
    const terms = await PolicyService.policyCount({where: {type: 'terms'}});
    res.json({privacy, terms, status: 'success', message: 'count fetched successfully'});
  } catch (err: any) {
    const error = new CoreError(
      'bad_request:api',
      err?.message ?? err?.cause,
      'An error occurred while fetching the policy count'
    ).toResponse();
    res.status(error.statusCode).json(error);
  }
});
export default router;
