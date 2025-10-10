import * as React from 'react';
import {browser} from 'webextension-polyfill-ts';
import {CHAT_HISTORY_LIMIT, CLARITY_API_URL, CLARITY_USER_ID_KEY} from '../../../common/constants';
import {LoadingSpinner} from '../shared';
import {ChatList} from './components/ChatList';
import {ChatData, ChatInLocalStorage} from './types.d';

import './styles.scss';
import {Chat} from './components/Chat';

type Action = 'history' | 'chat';

const getUserID = async (): Promise<string | null> => {
  const {clarityUserId} = await browser.storage.sync.get(CLARITY_USER_ID_KEY);
  return clarityUserId || null;
};

export const ChatComponent = (): React.ReactElement => {
  const [activeChat, setActiveChat] = React.useState<ChatData | null>(null);
  const [action, setAction] = React.useState<Action>('history');

  const [chatHistory, setChatHistory] = React.useState<ChatInLocalStorage>({
    chats: [],
    pagination: null,
    status: 'success',
    cachedAt: 0,
  });
  const [userId, setUserId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  const loadChatHistory = async (userIdParam: string): Promise<void> => {
    const response = await fetch(
      `${CLARITY_API_URL}/chat/history/${userIdParam}?page=1&limit=${CHAT_HISTORY_LIMIT}`
    );
    if (response.ok) {
      const data = await response.json();
      setChatHistory(data);
    } else {
      setChatHistory({
        chats: [],
        pagination: null,
        status: 'success',
        cachedAt: 0,
      });
    }
    setLoading(false);
  };

  const handleChatClick = (chatId: string): void => {
    // Find the chat and open it in a new tab or handle it as needed
    const chat = chatHistory.chats.find((c) => c.id === chatId);
    if (chat) {
      setActiveChat(chat);
      setAction('chat');
    }
  };

  const handleDeleteChat = (chatId: string): void => {
    if (userId) {
      const updatedHistory = chatHistory.chats.filter(
        (chat) => chat.id !== chatId
      );
      setChatHistory({...chatHistory, chats: updatedHistory});
    }
  };

  const initChat = async (): Promise<void> => {
    const userd = await getUserID();
    setUserId(userd);
    await loadChatHistory(userd!);
  };

  React.useEffect(() => {
    initChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading chat history..." />;
  }

  const handleBackToHistory = (): void => {
    setAction('history');
    setActiveChat(null);
  };

  const actions: Record<Action, React.ReactElement> = {
    history: (
      <ChatList
        chatHistory={chatHistory.chats}
        onChatClick={handleChatClick}
        onDeleteChat={handleDeleteChat}
      />
    ),
    chat: <Chat chat={activeChat} onBack={handleBackToHistory} />,
  };

  if (!userId) {
    return (
      <div className="welcome-section">
        <span className="icon">🔐</span>
        <div className="title">Please Sign In</div>
        <div className="subtitle">Sign in to view your chat history</div>
      </div>
    );
  }

  if (chatHistory.chats.length === 0) {
    return (
      <div className="welcome-section">
        <span className="icon">💬</span>
        <div className="title">No conversations yet</div>
        <div className="subtitle">Start a chat to see your history here</div>
      </div>
    );
  }

  return <div className="chat-history">{actions[action]}</div>;
};
