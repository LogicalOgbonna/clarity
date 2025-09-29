import ChatRepository from '@/db/repository/chat';
import {ChatDto, type InferType} from '@/db/dto/chat';
import {type chat as Chat, type message as Message} from '@prisma/client';
import {type Prisma} from '@prisma/client';
import {MessageService} from '../message';
import {convertToModelMessages, generateText, UIMessagePart} from 'ai';
import {azureProvider, SYSTEM_PROMPT} from '@/utils/model';
import {formatISO} from 'date-fns';
import {CustomUIDataTypes} from '@/db/dto/message';

export class ChatService {
  /**
   * Creates a new chat in the database.
   * @param data - The chat data to be created
   * @returns {Promise<Chat>} A promise that resolves to the newly created chat
   */
  static async create(data: InferType<typeof ChatDto.createChatDto> & {id?: string}): Promise<Omit<Chat, 'userId'>> {
    return ChatRepository.create(data);
  }

  public static async continue(data: InferType<typeof ChatDto.continueChatDto>): Promise<Message> {
    try {
      const {id, message} = ChatDto.continueChatDto.parse(data);
      const messages = await MessageService.findByChat({chatId: id});
      if (!messages.length) {
        throw new Error('Chat not found');
      }
      const newMessage = await MessageService.createMessage({
        chatId: id,
        content: message,
        role: 'user',
      });
      messages.push(newMessage);
      // Generate summary using LLM
      const {text: summary} = await generateText({
        model: azureProvider.chat('gpt-4.1'),
        messages: convertToModelMessages(
          messages.map((message) => ({
            id: message.id,
            role: message.role as 'user' | 'assistant' | 'system',
            parts: message.parts as UIMessagePart<CustomUIDataTypes, any>[],
            metadata: {
              createdAt: formatISO(message.createdAt),
            },
          }))
        ),
        system: SYSTEM_PROMPT,
      });
      const assistantMessage = await MessageService.createMessage({chatId: id, content: summary, role: 'assistant'});
      return assistantMessage;
    } catch (error) {
      console.error('Error continuing chat:', error);
      throw error;
    }
  }

  /**
   * Finds a chat by its ID.
   * @param data - The chat ID to find
   * @returns { Promise<Chat> } A promise that resolves to the chat if found
   */
  static async findByID(data: InferType<typeof ChatDto.idDto>): Promise<Omit<Chat, 'userId'>> {
    return ChatRepository.findByID(data);
  }

  /**
   * Finds all chats for a specific user.
   * @param data - The user ID to find chats for
   * @returns { Promise<Chat[]> } A promise that resolves to an array of chats
   */
  static async findByUser(data: InferType<typeof ChatDto.findByUserDto>): Promise<Omit<Chat, 'userId'>[]> {
    return ChatRepository.findByUser(data);
  }

  /**
   * Updates a chat in the database.
   * @param data - The chat ID to update
   * @param chat - The chat data to be updated
   * @returns { Promise<Chat> } A promise that resolves to the updated chat
   */
  static async update(
    data: InferType<typeof ChatDto.idDto>,
    chat: InferType<typeof ChatDto.updateChatDto>
  ): Promise<Omit<Chat, 'userId'>> {
    return ChatRepository.update(data, chat);
  }

  /**
   * Deletes a chat from the database.
   * @param data - The chat ID to delete
   * @returns { Promise<Chat> } A promise that resolves to the deleted chat
   */
  static async delete(data: InferType<typeof ChatDto.idDto>): Promise<Omit<Chat, 'userId'>> {
    return ChatRepository.delete(data);
  }

  /**
   * Finds chats by any criteria.
   * @param where - The criteria to find chats by
   * @returns { Promise<Chat[]> } A promise that resolves to an array of found chats
   */
  static async findByAny(where: Prisma.chatWhereInput): Promise<Omit<Chat, 'userId'>[]> {
    return ChatRepository.findByAny(where);
  }

  /**
   * Gets paginated chat history for a user.
   * @param data - The user ID and pagination parameters
   * @returns A promise that resolves to paginated chat results
   */
  static async getUserChatsPaginated(data: InferType<typeof ChatDto.getUserChatsDto>): Promise<{
    chats: Omit<Chat, 'userId'>[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    return ChatRepository.findByUserPaginated(data);
  }
}
