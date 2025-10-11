import {Router} from 'express';
import {PolicyService} from '@/services/policy';

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
      const existingPolicies = await PolicyService.findByID({hostname, type,  link});
      return res.json({
        policy: existingPolicies,
        status: 'success',
        message: 'Policy found successfully',
        created: false,
      });
      } catch(error) {
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
    } catch (error) {
      // console.error('Error in fetch-or-create:', error);
      res.status(500).json({
        error: JSON.stringify(error),
        status: 'error',
        message: 'Policy fetch/create failed',
      });
    }
  });

export default router;