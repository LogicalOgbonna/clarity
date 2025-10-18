import {ChatService} from '@/services/chat';
import {ChatDto} from '@/db/dto/chat';
import {Router} from 'express';
import {ZodError} from 'zod';
import historyRouter from './history';
import messageRouter from './message';
import { CoreError } from '@/utils/error';

const router: Router = Router();

// GET /api/chat/history/ - Get paginated chat history for a user
router.use('/history', historyRouter);

// POST /api/chat/message - Create a new message
router.use('/message', messageRouter);

// GET /api/chat/:id - Get specific chat by ID
router.get('/:id', async (req, res) => {
  try {
    const {id} = ChatDto.idDto.parse(req.params);

    const chat = await ChatService.findByID({where: {id}});

    res.json({
      chat,
      status: 'success',
      message: 'Chat retrieved successfully',
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      const error = new CoreError('bad_request:api', err?.message ?? err?.cause, 'Validation error').toResponse();
      return res.status(error.statusCode).json({...error, details: err.issues});
    }
    const error = new CoreError(
      'bad_request:api',
      err?.message ?? err?.cause,
      'An error occurred while retrieving the chat'
    ).toResponse();
    res.status(error.statusCode).json(error);
  }
});

// POST /api/chat/:id - Continue a chat
router.post('/:id', async (req, res) => {
  try {
    const {id} = ChatDto.idDto.parse(req.params);
    const chatData = ChatDto.continueChatDto.parse({id, message: req.body.message});

    const chat = await ChatService.continueChat(chatData);

    res.json({
      chat,
      status: 'success',
      message: 'Chat continued successfully',
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      const error = new CoreError('bad_request:api', err?.message ?? err?.cause, 'Validation error').toResponse();
      return res.status(error.statusCode).json({...error, details: err.issues});
    }
    const error = new CoreError(
      'bad_request:api',
      err?.message ?? err?.cause,
      'An error occurred while continuing the chat'
    ).toResponse();
    res.status(error.statusCode).json(error);
  }
});

// PUT /api/chat/:id - Update a chat
router.put('/:id', async (req, res) => {
  try {
    const {id} = ChatDto.idDto.parse(req.params);
    const updateData = ChatDto.updateChatDto.parse(req.body);

    const chat = await ChatService.update({id}, updateData);

    res.json({
      chat: chat,
      status: 'success',
      message: 'Chat updated successfully',
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      const error = new CoreError('bad_request:api', err?.message ?? err?.cause, 'Validation error').toResponse();
      return res.status(error.statusCode).json({...error, details: err.issues});
    }
    const error = new CoreError(
      'bad_request:api',
      err?.message ?? err?.cause,
      'An error occurred while updating the chat'
    ).toResponse();
    res.status(error.statusCode).json(error);
  }
});

// DELETE /api/chat/:id - Delete a chat
router.delete('/:id', async (req, res) => {
  try {
    const {id} = ChatDto.idDto.parse(req.params);

    await ChatService.delete({id});

    res.json({
      status: 'success',
      message: 'Chat deleted successfully',
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      const error = new CoreError('bad_request:api', err?.message ?? err?.cause, 'Validation error').toResponse();
      return res.status(error.statusCode).json({...error, details: err.issues});
    }
    const error = new CoreError('bad_request:api', err?.message ?? err?.cause, 'An error occurred while deleting the chat').toResponse();
    res.status(error.statusCode).json(error);
  }
});

// POST /api/chat - Create a new chat
router.post('/', async (req, res) => {
  try {
    const data = ChatDto.createChatByLinkDto.parse(req.body);

    const chat = await ChatService.createChatByLink(data);

    res.json({
      chat,
      status: 'success',
      message: 'Chat created by link successfully',
    });
    } catch (err: any) {
    if (err instanceof ZodError) {
      const error = new CoreError('bad_request:api', err?.message ?? err?.cause, 'Validation error').toResponse();
      return res.status(error.statusCode).json({...error, details: err.issues});
    }
    const error = new CoreError(
      'bad_request:api',
      err?.message ?? err?.cause,
      'An error occurred while creating the chat by link'
    ).toResponse();
    res.status(error.statusCode).json(error);
  }
});

export default router;
