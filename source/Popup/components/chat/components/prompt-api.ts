import {Message} from '../types.d';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const LanguageModel: {
  availability({monitor}: {monitor: (m: EventTarget) => void}): Promise<string>;
  create(data: any): Promise<{prompt: (data: any) => Promise<any>}>;
  params(): Promise<any>;
};

declare const self: {
  LanguageModel: typeof LanguageModel;
};

interface AskLLMProps {
  prompt: string;
  messages: Message[];
}

export const askLLM = async ({
  prompt,
  messages,
}: AskLLMProps): Promise<{
  success: boolean;
  message: string;
}> => {
  if (!self.LanguageModel)
    return {success: false, message: 'Language model is not available'};
  const availability = await self.LanguageModel.availability({
    monitor(m) {
      m.addEventListener('downloadprogress', (e: any) => {
        console.log(`Downloaded ${e.loaded * 100}%`);
      });
    },
  });
  if (availability === 'unavailable')
    return {success: false, message: 'Language model is unavailable'};
  const params = await self.LanguageModel.params();
  console.log('🚀 ~ askLLM ~ params:', params);
  const session = await self.LanguageModel.create({
    initialPrompts: [
      {
        role: 'system',
        content: `You are a helpful assistant summarizing boring legal pages like Terms of Service and Privacy Policies in a way a 5-year-old can understand. Be short, simple, and straight to the point.
Return your response as well-formatted HTML starting from a <div>, without including <html>, <head>, or <body> tags.`,
      },
      ...messages.map((message) => ({
        role: message.role,
        content: message.parts.map((part) => part.text).join(''),
      })),
    ],
  });
  const response = await session.prompt(prompt);
  console.log('🚀 ~ askLLM ~ response:', response);
  return {success: true, message: response};
};
