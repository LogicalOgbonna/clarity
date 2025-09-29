import {z} from 'zod';

export class ChatDto {
  public static createChatDto = z.object({
    id: z.string().optional(),
    title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
    userId: z.string().min(1, 'User ID is required'),
    visibility: z.enum(['public', 'private']).default('private'),
    traceId: z.string().optional(),
    observationId: z.string().optional(),
  });

  public static continueChatDto = z.object({
    id: z.string().min(1, 'Chat ID is required'),
    message: z.string().min(1, 'Message is required'),
  });

  public static idDto = z.object({
    id: z.string().min(1, 'Chat ID is required'),
  });

  public static updateChatDto = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
    visibility: z.enum(['public', 'private']).optional(),
    traceId: z.string().optional(),
    observationId: z.string().optional(),
  });

  public static findByUserDto = z.object({
    userId: z.string().min(1, 'User ID is required'),
  });

  public static paginationDto = z.object({
    page: z.number().int().min(1, 'Page must be at least 1').default(1),
    limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10),
  });

  public static getUserChatsDto = z.object({
    userId: z.string().min(1, 'User ID is required'),
    page: z.number().int().min(1, 'Page must be at least 1').default(1),
    limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10),
  });
}

export type InferType<T> = z.infer<T>;
