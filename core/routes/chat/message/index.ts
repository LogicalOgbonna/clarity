import {ChatService} from '@/services/chat';
import {ChatDto} from '@/db/dto/chat';
import {Router} from 'express';
import {ZodError} from 'zod';
import { MessageDto } from '@/db/dto/message';
import { MessageService } from '@/services/message';

const router: Router = Router();


// GET /api/chat/history/:userId - Get paginated chat history for a user
router.post('/:chatId', async (req, res) => {
  try {
    const {content, role, chatId} = MessageDto.createChatMessageDto.parse(req.body);
    const message = await MessageService.createMessage({content, role, chatId});
    res.json({message});
  } catch (error) {
    if (error instanceof ZodError) {
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
      message: 'Message creation failed',
    });
  }
});

export default router;