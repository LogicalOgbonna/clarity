import {PolicyService} from '@/services/policy';
import {ChatService} from '@/services/chat';
import {MessageService} from '@/services/message';
import {LLM_MODEL, PROMPTS, PromptType} from '@/utils/model';
import {openai} from '@ai-sdk/openai';
import {convertToModelMessages, generateObject, generateText, UIMessagePart} from 'ai';
import {SummaryDto} from '@/db/dto/summary';
import {CustomUIDataTypes} from '@/db/dto/message';
import {formatISO} from 'date-fns';
import {type chat as Chat} from '@prisma/client';
import {object, string} from 'zod';
import { UserService } from '../user';

export class SummaryService extends SummaryDto {
  /**
   * Creates a summary for a policy link and manages chat/message creation.
   * @param link - The policy link to summarize
   * @param type - The policy type (privacy/terms)
   * @param userId - The user ID for chat creation
   * @param messageId - Optional message ID for context
   * @returns A promise that resolves to the summary result
   */
  static async createSummary({
    link,
    type,
    userId,
    chatId,
    message,
  }: {
    link: string;
    type: PromptType;
    userId: string;
    chatId: string;
    message: string;
  }): Promise<{
    summary: string;
    chatId: string;
    policyId?: number;
    chat: Omit<Chat, 'userId'>;
  }> {
    try {
      // First, try to find existing policy in database
      const {hostname} = new URL(link);
      const existingPolicies = await PolicyService.findByAny({
        where: {
          hostname,
          type,
          link,
        },
        select: {content: true, id: true, createdAt: true},
      });
      // TODO: check if createdAt for the latest policy is more than 1 week old, fetch a new one and compare their dates
      // TODO: add restriction to the number of summaries a user can create in a month

      let policyContent: string;
      let policyId: number | undefined;

      if (existingPolicies.length > 0) {
        // Use existing policy content
        const existingPolicy = existingPolicies[0];
        if (existingPolicy) {
          policyContent = existingPolicy.content;
          policyId = existingPolicy.id;
        } else {
          throw new Error('Existing policy not found');
        }
      } else {
        // Create new policy (this will fetch and store the content)
        const newPolicy = await PolicyService.create({
          link,
          type,
          timeoutMs: '10000',
          waitFor: '',
        });
        policyContent = newPolicy.content;
        policyId = newPolicy.id;
      }

      try {
        await ChatService.findByID({where: {id: chatId}});
      } catch (error) {
        // const title = await this.generateTitleForChat(message);
        await ChatService.create({
          id: chatId,
          userId,
          title: message,
          visibility: 'private',
        });
      }

      // Create system message
      await MessageService.createMessage({
        chatId,
        content: policyContent,
        role: 'system',
      });

      // Create user message
      await MessageService.createMessage({
        chatId,
        content: message,
        role: 'user',
      });

      const messages = await MessageService.findByChat({chatId});

      // Generate summary using LLM
      const {text: summary} = await generateText({
        model: openai.chat(LLM_MODEL),
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
        system: PROMPTS[type],
      });

      // Create assistant message with summary
      await MessageService.createMessage({chatId, content: summary, role: 'assistant'});
      await UserService.incrementSummaries(userId);

      const chat = await ChatService.findByID({where: {id: chatId}});

      return {
        summary,
        chatId,
        policyId,
        chat,
      };
    } catch (error) {
      console.error('Error creating summary:', error);
      throw error;
    }
  }

  public static async generateTitleForChat(message: string): Promise<string> {
    const {
      object: {title},
    } = await generateObject({
      model: openai.chat(LLM_MODEL),
      prompt: message,
      schema: object({
        title: string().describe('The title of the chat'),
      }),
      system: `\n
            - you will generate a short title based on the text provided to you
            - do not do more than generating a single title
            - ensure it is not more than 80 characters long
            - return only a single title
            - the title should be a summary of the text provided to you
            - the title should be a single sentence not more than 80 characters
            - do not use quotes or colons`,
    });
    if (title.length > 80) return await this.generateTitleForChat(message);
    return title;
  }

  /**
   * Gets summary for a specific policy by ID.
   * @param policyId - The policy ID
   * @param userId - The user ID for chat creation
   * @returns A promise that resolves to the summary result
   */
  static async getSummaryByPolicyId({policyId, userId}: {policyId: number; userId: string}): Promise<{
    summary: string;
    chatId: string;
  }> {
    try {
      // Get policy by numeric ID
      const policy = await PolicyService.findByNumericID(policyId);

      // Create chat
      const chatTitle = `${policy.type.charAt(0).toUpperCase() + policy.type.slice(1)} Policy Summary - ${policy.hostname}`;
      const chat = await ChatService.create({
        userId,
        title: chatTitle,
        visibility: 'private',
      });

      // Create user message
      await MessageService.createMessage({
        chatId: chat.id,
        content: `Please summarize this ${policy.type} policy`,
        role: 'user',
      });

      // Generate summary using LLM
      const {text: summary} = await generateText({
        model: openai.chat(LLM_MODEL),
        prompt: policy.content,
        system: PROMPTS[policy.type as PromptType],
      });

      // Create assistant message with summary
      await MessageService.createMessage({chatId: chat.id, content: summary, role: 'assistant'});

      return {
        summary,
        chatId: chat.id,
      };
    } catch (error) {
      console.error('Error getting summary by policy ID:', error);
      throw error;
    }
  }
}
