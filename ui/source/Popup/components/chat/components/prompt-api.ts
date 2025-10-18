import {Message} from '../types.d';
import {getSetting, SETTINGS_KEYS} from '../../../../common/utils';

interface AskLLMProps {
  userMessage: string;
  messages: Message[];
  monitorDownloadProgress?: (progress: number) => void;
}

let session: LanguageModel | null = null;

export const askLLM = async ({
  userMessage,
  messages,
  monitorDownloadProgress,
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
        // System prompt is not required here as it is already set in the system message from the server
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
          monitorDownloadProgress?.(e.loaded * 100);
        });
      },
    });
  }
  const response = await session.prompt(userMessage);

  return {success: true, message: response};
};

export const closeLLM = async (): Promise<void> => {
  if (session) {
    session.destroy();
    session = null;
  }
};
