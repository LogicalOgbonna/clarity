import {ChatService} from '@/services/chat';
import {ChatDto} from '@/db/dto/chat';
import {Router} from 'express';
import {ZodError} from 'zod';
import historyRouter from './history';
import messageRouter from './message';

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
      error,
      status: 'error',
      message: 'Failed to retrieve chat',
    });
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
      error,
      status: 'error',
      message: 'Chat continuation failed',
    });
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
      error,
      status: 'error',
      message: 'Chat update failed',
    });
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
      error,
      status: 'error',
      message: 'Chat deletion failed',
    });
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
      error,
      status: 'error',
      message: 'Chat creation by link failed',
    });
  }
});

export default router;
