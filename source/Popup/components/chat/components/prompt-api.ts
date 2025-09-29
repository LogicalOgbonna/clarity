import {Message} from '../types.d';
import {getSetting, SETTINGS_KEYS} from '../../../utils';

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

let session: any;

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

  const defaultChromeLLMConfig = await getSetting<{
    temperature: number;
    topK: number;
  }>(SETTINGS_KEYS.CHROME_CONFIG, {
    temperature: 1,
    topK: 3,
  });

  if (!session) {
    session = await self.LanguageModel.create({
      initialPrompts: [
        {
          role: 'system',
          content: `You are a helpful assistant summarizing boring legal pages like Terms of Service and Privacy Policies in a way a 5-year-old can understand. 
        Be short, simple, and straight to the point. Return your response as well-formatted HTML starting from a <div>, without including <html>, <head>, or <body> tags.`,
        },
        ...messages.map((message) => ({
          role: message.role,
          content: message.parts.map((part) => part.text).join(''),
        })),
      ],
      // TODO: set the languages to the user selected default language
      expectedInputs: [
        {
          type: 'text',
          languages: ['en'],
        },
      ],
      // TODO: set the languages to the user selected default language
      expectedOutputs: [
        {
          type: 'text',
          languages: ['en'],
        },
      ],
      ...defaultChromeLLMConfig,
    });
  }
  const response = await session.prompt(prompt);

  return {success: true, message: response};
};

export const closeLLM = async (): Promise<void> => {
  if (session) {
    await session.destroy();
    session = null;
  }
};
