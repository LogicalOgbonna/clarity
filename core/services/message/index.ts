import MessageRepository from '@/db/repository/message';
import {MessageDto, type InferType, type CustomUIDataTypes} from '@/db/dto/message';
import {type message as Message} from '@prisma/client';
import {type Prisma} from '@prisma/client';
import type {UIMessagePart} from 'ai';
import {cuid} from 'zod';

export class MessageService {
  /**
   * Creates a new message in the database.
   * @param data - The message data to be created
   * @returns A promise that resolves to the newly created message
   */
  static async create(data: InferType<typeof MessageDto.createMessageDto>): Promise<Message> {
    return MessageRepository.create(data);
  }

  /**
   * Finds a message by its ID.
   * @param data - The message ID to find
   * @returns A promise that resolves to the message if found
   */
  static async findByID(data: InferType<typeof MessageDto.idDto>): Promise<Message> {
    return MessageRepository.findByID(data);
  }

  /**
   * Finds all messages for a specific chat.
   * @param data - The chat ID to find messages for
   * @returns A promise that resolves to an array of messages
   */
  static async findByChat(data: InferType<typeof MessageDto.findByChatDto>): Promise<Message[]> {
    return MessageRepository.findByChat(data);
  }

  /**
   * Updates a message in the database.
   * @param data - The message ID to update
   * @param message - The message data to be updated
   * @returns A promise that resolves to the updated message
   */
  static async update(
    data: InferType<typeof MessageDto.idDto>,
    message: InferType<typeof MessageDto.updateMessageDto>
  ): Promise<Message> {
    return MessageRepository.update(data, message);
  }

  /**
   * Deletes a message from the database.
   * @param data - The message ID to delete
   * @returns A promise that resolves to the deleted message
   */
  static async delete(data: InferType<typeof MessageDto.idDto>): Promise<Message> {
    return MessageRepository.delete(data);
  }

  /**
   * Finds messages by any criteria.
   * @param where - The criteria to find messages by
   * @returns A promise that resolves to an array of found messages
   */
  static async findByAny(where: Prisma.messageWhereInput): Promise<Message[]> {
    return MessageRepository.findByAny(where);
  }

  /**
   * Creates a user message in a chat.
   * @param chatId - The chat ID
   * @param content - The message content
   * @returns A promise that resolves to the created message
   */
  static async createMessage({
    chatId,
    content,
    role,
  }: InferType<typeof MessageDto.createChatMessageDto>): Promise<Message> {
    const parts: UIMessagePart<CustomUIDataTypes, any>[] = [
      {
        type: 'text',
        text: content,
      },
    ];

    return MessageRepository.create({
      chatId,
      role,
      parts,
      attachments: [],
    });
  }
}
