import React from 'react';
import type { ChatMessage } from '@contexts/ChatContext';

interface Props {
  message: ChatMessage;
}

const ChatMessage: React.FC<Props> = ({ message }) => {
  const label = message.sender === 'user' ? 'You' : 'Support';
  return (
    <div>
      <span className="text-gray-500 mr-2">{label}:</span>
      {message.messageType === 'image' && message.fileUrl ? (
        <img
          src={message.fileUrl}
          alt={message.fileName || 'image'}
          className="max-w-[150px] rounded inline"
        />
      ) : message.messageType === 'file' && message.fileUrl ? (
        <a
          href={message.fileUrl}
          target="_blank"
          rel="noopener"
          className="link"
        >
          {message.fileName || 'Download file'}
        </a>
      ) : (
        <span>{message.content}</span>
      )}
    </div>
  );
};

export default ChatMessage;
