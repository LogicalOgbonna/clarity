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

router.post('/fetch-or-create', async (req, res) => {
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
    const existingPolicies = await PolicyService.findByID({hostname, type, version: link});

    if (existingPolicies) {
      return res.json({
        policy: existingPolicies,
        status: 'success',
        message: 'Policy found successfully',
        created: false,
      });
    }

    // If not found, create new policy
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
  } catch (error) {
    console.error('Error in fetch-or-create:', error);
    res.status(500).json({
      error: JSON.stringify(error),
      status: 'error',
      message: 'Policy fetch/create failed',
    });
  }
});

export default router;
