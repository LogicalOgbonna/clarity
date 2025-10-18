import {ChatService} from '@/services/chat';
import {ChatDto} from '@/db/dto/chat';
import {Router} from 'express';
import {ZodError} from 'zod';
import { MessageDto } from '@/db/dto/message';
import { MessageService } from '@/services/message';
import { CoreError } from '@/utils/error';

const router: Router = Router();


// POST /api/chat/message/:chatId - Create a new message in a chat
router.post('/:chatId', async (req, res) => {
  try {
    const {content, role, chatId} = MessageDto.createChatMessageDto.parse(req.body);
    const message = await MessageService.createMessage({content, role, chatId});
    res.json({
      message,
      status: 'success',
    });
    } catch (err: any) {
    if (err instanceof ZodError) {
      const error = new CoreError('bad_request:api', err?.message ?? err?.cause, 'Validation error').toResponse();
      return res.status(error.statusCode).json({...error, details: err.issues});
    }
    const error = new CoreError(
      'bad_request:api',
      err?.message ?? err?.cause,
      'An error occurred while creating the message'
    ).toResponse();
    res.status(error.statusCode).json(error);
  }
});

export default router;