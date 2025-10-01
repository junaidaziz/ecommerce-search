import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import type { ChatMessage } from '@contexts/ChatContext';

interface Props {
  messages: ChatMessage[];
  isTyping?: boolean;
  isLoading?: boolean;
}

const MessageList: React.FC<Props> = ({ messages, isTyping, isLoading }) => {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-1">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500 text-sm">Loading chat history...</div>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
          <p>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        messages.map((m) => <MessageBubble key={m.id} message={m} />)
      )}
      {isTyping && (
        <div className="flex justify-start mb-3">
          <div className="bg-base-200 text-base-content rounded-lg rounded-bl-none px-4 py-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
};

export default MessageList;
