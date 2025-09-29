import {SummaryDto} from '@/db/dto/summary';
import {SummaryService} from '@/services/summary';
import {Router} from 'express';
import {z} from 'zod';

const router: Router = Router();

// POST /api/summary - Create summary from link
router.post('/', async (req, res) => {
  try {
    const {link, type, userId, chatId, message} = SummaryDto.summaryRequestSchema.parse(req.body);

    const result = await SummaryService.createSummary({
      link,
      type,
      userId,
      chatId,
      message,
    });

    res.json({
      text: result.summary,
      chatId: result.chatId,
      policyId: result.policyId,
      chat: result.chat,
      status: 'success',
      message: 'Summary created successfully',
    });
  } catch (error) {
    console.error('Error creating summary:', error);
    if (error instanceof z.ZodError) {
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
      message: 'Summary creation failed',
    });
  }
});

// POST /api/summary/by-policy-id - Create summary from existing policy ID
router.post('/by-policy-id', async (req, res) => {
  try {
    const {policyId, userId} = SummaryDto.summaryByPolicyIdSchema.parse(req.body);

    const result = await SummaryService.getSummaryByPolicyId({
      policyId,
      userId,
    });

    res.json({
      summary: result.summary,
      chatId: result.chatId,
      status: 'success',
      message: 'Summary created successfully',
    });
  } catch (error) {
    console.error('Error creating summary by policy ID:', error);
    if (error instanceof z.ZodError) {
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
      message: 'Summary creation failed',
    });
  }
});

export default router;
