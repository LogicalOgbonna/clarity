import {z} from 'zod';
import type {UIMessagePart} from 'ai';

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  suggestion: any;
  appendMessage: string;
  id: string;
  title: string;
  kind: any;
  clear: null;
  finish: null;
};

export class MessageDto {
  public static createMessageDto = z.object({
    chatId: z.string().min(1, 'Chat ID is required'),
    role: z.enum(['user', 'assistant', 'system']),
    parts: z.array(z.any()) as z.ZodType<UIMessagePart<CustomUIDataTypes, any>[]>, // AI SDK UIMessagePart array
    attachments: z.any().optional(), // JSON field
  });

  public static idDto = z.object({
    id: z.string().min(1, 'Message ID is required'),
  });

  public static findByChatDto = z.object({
    chatId: z.string().min(1, 'Chat ID is required'),
  });

  public static updateMessageDto = z.object({
    role: z.enum(['user', 'assistant', 'system']).optional(),
    parts: z.array(z.any()).optional() as z.ZodType<UIMessagePart<CustomUIDataTypes, any>[] | undefined>,
    attachments: z.any().optional(),
  });

  public static createChatMessageDto = z.object({
    chatId: z.string().min(1, 'Chat ID is required'),
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1, 'Content is required'),
  });
}

export type InferType<T> = z.infer<T>;
