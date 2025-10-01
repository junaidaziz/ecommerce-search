import React from 'react';
import type { ChatMessage } from '@contexts/ChatContext';

interface Props {
  message: ChatMessage;
}

const MessageBubble: React.FC<Props> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[75%] rounded-lg px-3 py-2 ${
          isUser
            ? 'bg-primary text-white rounded-br-none'
            : 'bg-base-200 text-base-content rounded-bl-none'
        }`}
      >
        {message.messageType === 'image' && message.fileUrl ? (
          <div>
            <img
              src={message.fileUrl}
              alt={message.fileName || 'image'}
              className="max-w-full rounded mb-1"
              style={{ maxHeight: '200px' }}
            />
            {message.content && (
              <p className="text-sm mt-1">{message.content}</p>
            )}
          </div>
        ) : message.messageType === 'file' && message.fileUrl ? (
          <div>
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 ${
                isUser ? 'text-white hover:text-gray-200' : 'text-primary hover:text-primary-dark'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm font-medium">
                {message.fileName || 'Download file'}
              </span>
            </a>
            {message.content && (
              <p className="text-sm mt-2">{message.content}</p>
            )}
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}
        <div
          className={`text-xs mt-1 ${
            isUser ? 'text-white/70' : 'text-gray-500'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
