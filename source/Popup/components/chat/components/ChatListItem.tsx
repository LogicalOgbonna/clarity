import * as React from 'react';
import {ChatProps} from '../types.d';
import {formatTimestamp} from '../../../utils';

export const ChatListItem: React.FC<ChatProps> = ({
  chat,
  onChatClick,
  onDeleteChat,
}) => {
  const {title, createdAt, id} = chat;
  const titleToDisplay = title.length > 28 ? `${title.slice(0, 28)}...` : title;
  const needsTooltip = title.length > 28;
  const hostname = id.split('_')[0] || 'Unknown';
  return (
    <div
      key={id}
      className="chat-item"
      onClick={() => onChatClick(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onChatClick(id);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="chat-content">
        <div className="chat-title" title={needsTooltip ? title : undefined}>
          {titleToDisplay}
        </div>
        <div className="chat-meta">
          <span className="chat-time">
            {formatTimestamp(new Date(createdAt).getTime())}
          </span>
          <span className="chat-domain">{hostname}</span>
        </div>
      </div>
      <button
        type="button"
        className="delete-chat-btn"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteChat(id);
        }}
        title="Delete chat"
      >
        🗑️
      </button>
    </div>
  );
};
