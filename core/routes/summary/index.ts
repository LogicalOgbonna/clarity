import {SummaryDto} from '@/db/dto/summary';
import {SummaryService} from '@/services/summary';
import {CoreError} from '@/utils/error';
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
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      const error = new CoreError('bad_request:api', err?.message ?? err?.cause, 'Validation error').toResponse();
      return res.status(error.statusCode).json({...error, details: err.issues});
    }
    const error = new CoreError(
      'bad_request:api',
      err?.message ?? err?.cause,
      'An error occurred while creating the summary'
    ).toResponse();
    res.status(error.statusCode).json(error);
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
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      const error = new CoreError('bad_request:api', err?.message ?? err?.cause, 'Validation error').toResponse();
      return res.status(error.statusCode).json({...error, details: err.issues});
    }
    const error = new CoreError(
      'bad_request:api',
      err?.message ?? err?.cause,
      'An error occurred while creating the summary by policy ID'
    ).toResponse();
    res.status(error.statusCode).json(error);
  }
});

export default router;
