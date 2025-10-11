import {Message} from '../types.d';
import {getSetting, SETTINGS_KEYS} from '../../../../common/utils';

interface AskLLMProps {
  prompt: string;
  messages: Message[];
}

let session: LanguageModel | null = null;

export const askLLM = async ({
  prompt,
  messages,
}: AskLLMProps): Promise<{
  success: boolean;
  message: string;
}> => {
  if (!LanguageModel) return {success: false, message: 'Language model is not available'};
  const availability = await LanguageModel.availability({});
  if (availability === 'unavailable') return {success: false, message: 'Language model is unavailable'};

  const defaultChromeLLMConfig = await getSetting<{
    temperature: number;
    topK: number;
  }>(SETTINGS_KEYS.CHROME_CONFIG, {
    temperature: 1,
    topK: 3,
  });

  if (!session) {
    session = await LanguageModel.create({
      initialPrompts: [
        {
          role: 'system',
          content: `You are a helpful assistant summarizing boring legal pages like Terms of Service and Privacy Policies in a way a 5-year-old can understand. 
        Be short, simple, and straight to the point. Return your response as well-formatted HTML starting from a <div>, without including <html>, <head>, or <body> tags.`,
        },
        ...messages.map((message) => ({
          role: message.role as LanguageModelMessageRole,
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
      monitor: (m) => {
        m.addEventListener('downloadprogress', (e: any) => {
          console.log(`Downloaded ${e.loaded * 100}%`);
        });
      },
    });
  }
  const response = await session.prompt(prompt);

  return {success: true, message: response};
};

export const closeLLM = async (): Promise<void> => {
  if (session) {
    session.destroy();
    session = null;
  }
};
