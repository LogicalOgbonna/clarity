export interface Message {
  chatId: string;
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: {
    type:
      | 'text'
      | 'reasoning'
      | 'source-url'
      | 'source-document'
      | 'file'
      | 'step-start'
      | 'step-end';
    text: string;
  }[];
  attachments: unknown[];
  createdAt: string;
}

export interface ChatData {
  id: string;
  createdAt: string;
  title: string;
  visibility: string;
  traceId: string | null;
  observationId: string | null;
  messages: Message[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface ChatInLocalStorage {
  chats: ChatData[];
  pagination: Pagination | null;
  status: string;
  cachedAt: number;
}

export interface ChatListProps {
  chatHistory: ChatData[];
  onChatClick: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}
export interface ChatProps {
  chat: ChatData;
  onChatClick: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}
