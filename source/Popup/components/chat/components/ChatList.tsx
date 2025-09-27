import * as React from 'react';
import {ChatListProps} from '../types.d';
import {ChatListItem} from './ChatListItem';

export const ChatList: React.FC<ChatListProps> = ({
  chatHistory,
  onChatClick,
  onDeleteChat,
}) => {
  return (
    <React.Fragment>
      <div className="chat-header">
        <h3>Chat History</h3>
        <span className="chat-count">{chatHistory.length} conversations</span>
      </div>
      <div className="chat-list">
        {chatHistory.map((chat) => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            onChatClick={onChatClick}
            onDeleteChat={onDeleteChat}
          />
        ))}
      </div>
    </React.Fragment>
  );
};
