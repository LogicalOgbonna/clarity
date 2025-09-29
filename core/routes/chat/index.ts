import {ChatService} from '@/services/chat';
import {ChatDto} from '@/db/dto/chat';
import {Router} from 'express';
import {ZodError} from 'zod';
import historyRouter from './history';

const router: Router = Router();

// GET /api/chat/history/:userId - Get paginated chat history for a user
router.use('/history', historyRouter);

// GET /api/chat/:id - Get specific chat by ID
router.get('/:id', async (req, res) => {
  try {
    const {id} = ChatDto.idDto.parse(req.params);

    const chat = await ChatService.findByID({id});

    res.json({
      chat,
      status: 'success',
      message: 'Chat retrieved successfully',
    });
  } catch (error) {
    console.error('Error getting chat by ID:', error);
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
      message: 'Failed to retrieve chat',
    });
  }
});

// POST /api/chat - Create a new chat
router.post('/:id', async (req, res) => {
  try {
    const {id} = ChatDto.idDto.parse(req.params);
    const chatData = ChatDto.continueChatDto.parse({id, message: req.body.message});

    const chat = await ChatService.continue(chatData);

    res.json({
      chat,
      status: 'success',
      message: 'Chat created successfully',
    });
  } catch (error) {
    console.error('Error creating chat:', error);
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
      message: 'Chat creation failed',
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
    console.error('Error updating chat:', error);
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
    console.error('Error deleting chat:', error);
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
      message: 'Chat deletion failed',
    });
  }
});

export default router;
