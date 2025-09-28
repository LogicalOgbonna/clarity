import * as React from 'react';
import {ChatData, Message} from '../types.d';
import {formatTimestamp, getSetting, SETTINGS_KEYS} from '../../../utils';
import {CLARITY_API_URL} from '../../../../common/constants';
import {askLLM} from './prompt-api';
import {LanguageOptions} from '../../shared/language';

interface ChatProps {
  chat?: ChatData | null;
  onBack?: () => void;
}

declare const Translator: {
  availability({
    sourceLanguage,
    targetLanguage,
    monitor,
  }: {
    sourceLanguage: string;
    targetLanguage: string;
    monitor: (m: EventTarget) => void;
  }): Promise<string>;
  create({
    sourceLanguage,
    targetLanguage,
  }: {
    sourceLanguage: string;
    targetLanguage: string;
  }): Promise<{translate: (text: string) => Promise<string>}>;
};

declare const self: {
  Translator: typeof Translator;
};

export const Chat: React.FC<ChatProps> = ({chat = null, onBack}) => {
  const [currentSourceLanguage, setCurrentSourceLanguage] = React.useState<
    Record<string, string>
  >({});
  const [defaultLanguage, setDefaultLanguage] = React.useState<string>('en');
  const [inputValue, setInputValue] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [messages, setMessages] = React.useState<Message[]>(
    chat?.messages || []
  );

  React.useEffect(() => {
    if (chat?.messages) {
      setMessages(chat.messages);
    }
    const loadSettings = async (): Promise<void> => {
      const language = await getSetting(SETTINGS_KEYS.LANGUAGE, 'en');
      setDefaultLanguage(language);
    };
    loadSettings();
  }, [chat?.messages]);

  if (!chat) {
    return (
      <div className="chat-error">
        <div className="error-icon">⚠️</div>
        <div className="error-title">No chat found</div>
        <div className="error-subtitle">
          Please select a chat from the history
        </div>
      </div>
    );
  }

  const handleSendMessageWithChromeLLM = async (): Promise<void> => {
    setIsLoading(true);

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: `user_message_${new Date().getTime()}`,
        role: 'user',
        parts: [{text: inputValue, type: 'text'}],
        createdAt: new Date().toISOString(),
        chatId: chat.id,
        attachments: [],
      },
    ]);
    try {
      const response = await askLLM({prompt: inputValue, messages});
      if (response.success) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: `assistant_message_${new Date().getTime()}`,
            role: 'assistant',
            parts: [{text: response.message, type: 'text'}],
            createdAt: new Date().toISOString(),
            chatId: chat.id,
            attachments: [],
          },
        ]);
        // TODO: Send message to server to be saved
      } else {
        console.error('Failed to send message:', response.message);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
      setInputValue('');
    }
  };

  const handleSendMessageWithServerLLM = async (): Promise<void> => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: `user_message_${new Date().getTime()}`,
        role: 'user',
        parts: [{text: inputValue, type: 'text'}],
        createdAt: new Date().toISOString(),
        chatId: chat.id,
        attachments: [],
      },
    ]);
    try {
      const response = await fetch(`${CLARITY_API_URL}/chat/${chat.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({message: inputValue}),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prevMessages) => [...prevMessages, data.chat]);
        setIsLoading(false);
        setInputValue('');
      } else {
        console.error('Failed to send message:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
      setInputValue('');
    }
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!inputValue.trim() || isLoading) return;

    setIsLoading(true);

    const llmProvider = await getSetting<'chrome' | 'server'>(
      SETTINGS_KEYS.LLM_PROVIDER,
      'chrome'
    );

    if (llmProvider === 'chrome') {
      await handleSendMessageWithChromeLLM();
    } else {
      await handleSendMessageWithServerLLM();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTranslateMessage = async (
    messageId: string,
    targetLanguage: string,
    sourceLanguage: string
  ): Promise<void> => {
    if (!targetLanguage || !sourceLanguage) return;
    if (!self.Translator) return;
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;
    const message = messages[messageIndex];
    const availability = await self.Translator.availability({
      sourceLanguage,
      targetLanguage,
      monitor: (m) => {
        console.log('Translator availability:', m);
      },
    });
    if (message && availability !== 'unavailable') {
      setCurrentSourceLanguage({
        ...currentSourceLanguage,
        [messageId]: targetLanguage,
      });
      await self.Translator.create({
        sourceLanguage,
        targetLanguage,
      }).then((translator) => {
        translator
          .translate(message.parts.map((part) => part.text).join(''))
          .then((translatedText) => {
            message.parts = [{text: translatedText, type: 'text'}];
            messages[messageIndex] = message;
            setMessages([...messages]);
          });
      });
    }
  };

  const renderMessage = (
    message: ChatData['messages'][0],
    index: number
  ): React.ReactElement => {
    const isUser = message.role === 'user';
    const content = message.parts.map((part) => part.text).join('');

    // TODO: use tht language detector api to detect the language of the message,
    // if it's not same as the default language, then translate the message to the default language

    return (
      <div
        key={message.id || index}
        className={`message ${isUser ? 'user-message' : 'assistant-message'}`}
      >
        <div
          className="message-content"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{__html: content}}
        />
        <div
          className={`message-time ${isUser ? 'message-time-user' : 'message-time-assistant'}`}
        >
          {formatTimestamp(new Date(message.createdAt).getTime())}
        </div>
        {!isUser && (
          <div className="message-actions">
            <LanguageOptions
              value={currentSourceLanguage[message.id] ?? defaultLanguage}
              onChange={(language) => {
                handleTranslateMessage(
                  message.id,
                  language,
                  currentSourceLanguage[message.id] ?? defaultLanguage
                );
              }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="chat-interface">
      {/* Chat Header */}
      <div className="interface-header">
        <button
          type="button"
          className="back-button"
          onClick={onBack}
          title="Back to chat history"
        >
          ←
        </button>
      </div>

      {/* Chat Content */}
      <div className="chat-content">
        {messages && messages.length > 0 ? (
          messages.map((message, index) => renderMessage(message, index))
        ) : (
          <div className="empty-chat">
            <div className="empty-icon">💬</div>
            <div className="empty-title">Start a conversation</div>
            <div className="empty-subtitle">
              Ask me anything about this chat
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="message assistant-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span>Thinking</span>
                <div className="typing-dots">
                  <div className="dot" />
                  <div className="dot" />
                  <div className="dot" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="chat-input-area">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything..."
          className="chat-input"
          disabled={isLoading}
        />
        <button
          type="button"
          className="send-button"
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading}
        >
          →
        </button>
      </div>
    </div>
  );
};
