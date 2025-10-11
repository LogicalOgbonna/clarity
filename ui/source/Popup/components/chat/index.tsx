import * as React from 'react';
import {CLARITY_USER_ID_KEY} from '../../../common/constants';
import {getChatHistory, User} from '../../api';
import {LoadingSpinner} from '../shared';
import {SignUpSignin} from '../shared/auth';
import {Chat} from './components/Chat';
import {ChatList} from './components/ChatList';
import {ChatData, ChatInLocalStorage} from './types.d';
import {getSetting} from '../../utils';

import './styles.scss';

type Action = 'history' | 'chat';

export const ChatComponent = ({
  user,
  isLoading,
  isFetching,
}: {
  user?: User;
  isLoading: boolean;
  isFetching: boolean;
}): React.ReactElement => {
  if (isLoading || isFetching) {
    return <LoadingSpinner text="Loading chat history..." />;
  }

  if (!user || !user.name) {
    return <SignUpSignin defaultMode="login" />;
  }

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
    const response = await getChatHistory({userId: userIdParam});
    if (response.status === 'success') {
      const data = {
        chats: response.chats,
        pagination: response.pagination,
        status: response.status,
        cachedAt: response.cachedAt,
      };
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
      const updatedHistory = chatHistory.chats.filter((chat) => chat.id !== chatId);
      setChatHistory({...chatHistory, chats: updatedHistory});
    }
  };

  const initChat = async (): Promise<void> => {
    const userd = await getSetting(CLARITY_USER_ID_KEY, '');
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
    history: <ChatList chatHistory={chatHistory.chats} onChatClick={handleChatClick} onDeleteChat={handleDeleteChat} />,
    chat: <Chat chat={activeChat} onBack={handleBackToHistory} />,
  };

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
