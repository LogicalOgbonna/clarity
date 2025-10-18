import {ChatService} from '@/services/chat';
import {ChatDto} from '@/db/dto/chat';
import {Router} from 'express';
import {ZodError} from 'zod';
import { CoreError } from '@/utils/error';

const router: Router = Router();

// GET /api/chat/history/:userId - Get paginated chat history for a user
router.get('/:userId', async (req, res) => {
  try {
    const {id} = ChatDto.idDto.parse({id: req.params.userId});
    const {page, limit} = ChatDto.paginationDto.parse({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
    });

    const result = await ChatService.getUserChatsPaginated({
      userId: id,
      page,
      limit,
    });

    res.json({
      chats: result.chats,
      pagination: result.pagination,
      status: 'success',
      message: 'Chat history retrieved successfully',
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      const error = new CoreError('bad_request:api', err?.message ?? err?.cause, 'Validation error').toResponse();
      return res.status(error.statusCode).json({...error, details: err.issues});
    }
    const error = new CoreError(
      'bad_request:api',
      err?.message ?? err?.cause,
      'An error occurred while retrieving the chat history'
    ).toResponse();
    res.status(error.statusCode).json(error);
  }
});

export default router;
