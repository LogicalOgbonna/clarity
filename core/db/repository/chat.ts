import {type chat as Chat} from '@prisma/client';
import {type Prisma} from '@prisma/client';

import {db} from '@/db';
import {ChatDto, type InferType} from '@/db/dto/chat';

class ChatRepository extends ChatDto {
  static async create(chat: InferType<typeof ChatDto.createChatDto>): Promise<Omit<Chat, 'userId'>> {
    try {
      const data = ChatDto.createChatDto.parse(chat);
      // Filter out undefined values for Prisma
      const filteredData = Object.fromEntries(Object.entries(data).filter(([_, value]) => value !== undefined)) as any;
      return db.chat.create({
        data: filteredData,
        select: {
          id: true,
          title: true,
          visibility: true,
          traceId: true,
          observationId: true,
          createdAt: true,
          messages: {
            where: {
              role: {
                in: ['user', 'assistant'],
              },
            },
            orderBy: {createdAt: 'asc'},
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async findByID(data: InferType<typeof ChatDto.idDto>): Promise<Omit<Chat, 'userId'>> {
    try {
      const {id} = ChatDto.idDto.parse(data);
      return db.chat.findUniqueOrThrow({
        where: {id},
        select: {
          id: true,
          title: true,
          visibility: true,
          traceId: true,
          observationId: true,
          createdAt: true,
          messages: {
            where: {
              role: {
                in: ['user', 'assistant'],
              },
            },
            orderBy: {createdAt: 'asc'},
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async findByUser(data: InferType<typeof ChatDto.findByUserDto>): Promise<Omit<Chat, 'userId'>[]> {
    try {
      const {userId} = ChatDto.findByUserDto.parse(data);
      return db.chat.findMany({
        where: {userId},
        select: {
          id: true,
          title: true,
          visibility: true,
          traceId: true,
          observationId: true,
          createdAt: true,
          messages: {
            where: {
              role: {
                in: ['user', 'assistant'],
              },
            },
            orderBy: {createdAt: 'asc'},
          },
        },
        orderBy: {createdAt: 'desc'},
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(
    data: InferType<typeof ChatDto.idDto>,
    chat: InferType<typeof ChatDto.updateChatDto>
  ): Promise<Omit<Chat, 'userId'>> {
    try {
      const {id} = ChatDto.idDto.parse(data);
      const updateData = ChatDto.updateChatDto.parse(chat);
      // Filter out undefined values for Prisma
      const filteredData = Object.fromEntries(Object.entries(updateData).filter(([_, value]) => value !== undefined));
      return db.chat.update({
        where: {id},
        data: filteredData,
        select: {
          id: true,
          title: true,
          visibility: true,
          traceId: true,
          observationId: true,
          createdAt: true,
          messages: {
            where: {
              role: {
                in: ['user', 'assistant'],
              },
            },
            orderBy: {createdAt: 'asc'},
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(data: InferType<typeof ChatDto.idDto>): Promise<Chat> {
    try {
      const {id} = ChatDto.idDto.parse(data);
      return db.chat.delete({where: {id}});
    } catch (error) {
      throw error;
    }
  }

  static async findByAny(where: Prisma.chatWhereInput): Promise<Omit<Chat, 'userId'>[]> {
    try {
      return db.chat.findMany({
        where,
        select: {
          id: true,
          title: true,
          visibility: true,
          traceId: true,
          observationId: true,
          createdAt: true,
          messages: {
            where: {
              role: {
                in: ['user', 'assistant'],
              },
            },
            orderBy: {createdAt: 'asc'},
          },
        },
        orderBy: {createdAt: 'desc'},
      });
    } catch (error) {
      throw error;
    }
  }

  static async findByUserPaginated(data: InferType<typeof ChatDto.getUserChatsDto>): Promise<{
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
    try {
      const {userId, page, limit} = ChatDto.getUserChatsDto.parse(data);
      const skip = (page - 1) * limit;

      // Get total count for pagination
      const total = await db.chat.count({
        where: {userId},
      });

      // Get paginated chats
      const chats = await db.chat.findMany({
        where: {userId},
        select: {
          id: true,
          title: true,
          visibility: true,
          traceId: true,
          observationId: true,
          createdAt: true,
          messages: {
            where: {
              role: {
                in: ['user', 'assistant'],
              },
            },
            orderBy: {createdAt: 'asc'},
          },
        },
        orderBy: {createdAt: 'desc'},
        skip,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        chats,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

export default ChatRepository;
