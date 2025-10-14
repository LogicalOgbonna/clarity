import {ChatService} from '@/services/chat';
import {ChatDto} from '@/db/dto/chat';
import {Router} from 'express';
import {ZodError} from 'zod';

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
  } catch (error) {
    console.error('Error getting user chat history:', error);
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.issues,
        status: 'error',
        message: 'Invalid request data',
      });
    }
    res.status(500).json({
      error,
      status: 'error',
      message: 'Failed to retrieve chat history',
    });
  }
});

export default router;
