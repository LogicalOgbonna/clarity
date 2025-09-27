import * as React from 'react';
import {ChatData, Message} from '../types.d';
import {formatTimestamp} from '../../../utils';
import {CLARITY_API_URL} from '../../../../common/constants';

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

  const [inputValue, setInputValue] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [messages, setMessages] = React.useState<Message[]>(
    chat?.messages || []
  );

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

  const handleSendMessage = async (): Promise<void> => {
    if (!inputValue.trim() || isLoading) return;

    setIsLoading(true);

    const response = await fetch(`${CLARITY_API_URL}/chat/${chat.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({message: inputValue}),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('🚀 ~ handleSendMessage ~ data:', data);
      setMessages([...messages, data.chat]);
      setIsLoading(false);
      setInputValue('');
    } else {
      console.error('Failed to send message:', response.statusText);
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
    console.log('🚀 ~ handleTranslateMessage ~ availability:', availability);
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

  const renderLanguageSelector = (messageId: string): React.ReactElement => {
    return (
      <div className="language-selector">
        <select
          className="translate-selector"
          value={currentSourceLanguage[messageId] ?? 'en'}
          data-message-id={messageId}
          onChange={(e) => {
            handleTranslateMessage(
              messageId,
              e.target.value,
              currentSourceLanguage[messageId] ?? 'en'
            );
          }}
        >
          <option value="">🌐 Translate</option>
          <option value="en">🏴󠁧󠁢󠁥󠁮󠁧󠁿 English</option>
          <option value="es">🇪🇸 Spanish</option>
          <option value="fr">🇫🇷 French</option>
          <option value="de">🇩🇪 German</option>
          <option value="it">🇮🇹 Italian</option>
          <option value="pt">🇵🇹 Portuguese</option>
          <option value="ru">🇷🇺 Russian</option>
          <option value="ja">🇯🇵 Japanese</option>
          <option value="ko">🇰🇷 Korean</option>
          <option value="zh">🇨🇳 Chinese</option>
          <option value="ar">🇸🇦 Arabic</option>
          <option value="hi">🇮🇳 Hindi</option>
        </select>
      </div>
    );
  };

  const renderMessage = (
    message: ChatData['messages'][0],
    index: number
  ): React.ReactElement => {
    const isUser = message.role === 'user';
    const content = message.parts.map((part) => part.text).join('');

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
        {!isUser && (
          <div className="message-actions">
            {renderLanguageSelector(message.id)}
          </div>
        )}
        <div className="message-time">
          {formatTimestamp(new Date(message.createdAt).getTime())}
        </div>
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
