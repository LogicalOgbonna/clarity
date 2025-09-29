import {type message as Message} from '@prisma/client';
import {type Prisma} from '@prisma/client';

import {db} from '@/db';
import {MessageDto, type InferType} from '@/db/dto/message';

class MessageRepository extends MessageDto {
  static async create(message: InferType<typeof MessageDto.createMessageDto>): Promise<Message> {
    try {
      const data = MessageDto.createMessageDto.parse(message);
      // Filter out undefined values for Prisma
      const filteredData = Object.fromEntries(Object.entries(data).filter(([_, value]) => value !== undefined)) as any;
      return db.message.create({data: filteredData});
    } catch (error) {
      throw error;
    }
  }

  static async findByID(data: InferType<typeof MessageDto.idDto>): Promise<Message> {
    try {
      const {id} = MessageDto.idDto.parse(data);
      return db.message.findUniqueOrThrow({where: {id}});
    } catch (error) {
      throw error;
    }
  }

  static async findByChat(data: InferType<typeof MessageDto.findByChatDto>): Promise<Message[]> {
    try {
      const {chatId} = MessageDto.findByChatDto.parse(data);
      return db.message.findMany({
        where: {chatId},
        orderBy: {createdAt: 'asc'},
      });
    } catch (error) {
      throw error;
    }
  }

  static async getMessagesByChatId(id: string): Promise<Message> {
    try {
      return db.message.findUniqueOrThrow({
        where: {id},
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(
    data: InferType<typeof MessageDto.idDto>,
    message: InferType<typeof MessageDto.updateMessageDto>
  ): Promise<Message> {
    try {
      const {id} = MessageDto.idDto.parse(data);
      const updateData = MessageDto.updateMessageDto.parse(message);
      // Filter out undefined values for Prisma
      const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      ) as any;
      return db.message.update({
        where: {id},
        data: filteredData,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(data: InferType<typeof MessageDto.idDto>): Promise<Message> {
    try {
      const {id} = MessageDto.idDto.parse(data);
      return db.message.delete({where: {id}});
    } catch (error) {
      throw error;
    }
  }

  static async findByAny(where: Prisma.messageWhereInput): Promise<Message[]> {
    try {
      return db.message.findMany({
        where,
        orderBy: {createdAt: 'asc'},
      });
    } catch (error) {
      throw error;
    }
  }
}

export default MessageRepository;
