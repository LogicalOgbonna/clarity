import {Router} from 'express';
import {PolicyService} from '@/services/policy';
import {CoreError} from '@/utils/error';
import {PROMPTS} from '@/utils/model';

const router: Router = Router();

router.post('/', async (req, res) => {
  try {
    const {domain, link, type} = req.body;

    if (!domain || !link || !type) {
      return res.status(400).json({
        error: 'Missing required fields',
        status: 'error',
        message: 'domain, link, and type are required',
      });
    }

    const {hostname} = new URL(domain);
    // First, try to find existing policy
    try {
      const existingPolicies = await PolicyService.findByID({hostname, type, link});
      return res.json({
        policy: existingPolicies,
        status: 'success',
        message: 'Policy found successfully',
        created: false,
      });
    } catch (error) {
      const {content: _content, ...newPolicy} = await PolicyService.create({
        link,
        type,
        timeoutMs: '10000',
        waitFor: '',
      });

      res.json({
        policy: newPolicy,
        status: 'success',
        message: 'Policy created successfully',
        created: true,
      });
    }

    // If not found, create new policy
  } catch (err: any) {
    const error = new CoreError(
      'bad_request:api',
      err?.message ?? err?.cause,
      'An error occurred while fetching or creating the policy'
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
      'An error occurred while fetching the count'
    ).toResponse();
    res.status(error.statusCode).json(error);
  }
});

router.get('/prompt', async (req, res) => {
  try {
    const terms = PROMPTS.terms;
    const privacy = PROMPTS.privacy;
    res.json({terms, privacy, status: 'success', message: 'prompts fetched successfully'});
  } catch (err: any) {
    const error = new CoreError(
      'bad_request:api',
      err?.message ?? err?.cause,
      'An error occurred while fetching the prompt'
    ).toResponse();
    res.status(error.statusCode).json(error);
  }
});
export default router;
