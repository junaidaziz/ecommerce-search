import React, { useContext, useEffect, useRef } from 'react';
import { ChatContext } from '@contexts/ChatContext';
import ChatIcon from '../icons/ChatIcon';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

const ChatWindow: React.FC = () => {
  const { messages, isOpen, openChat, closeChat } = useContext(ChatContext);
  const endRef = useRef<HTMLDivElement | null>(null);

  const toggle = () => {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  };

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-base-100 rounded-lg shadow-lg border border-base-300 w-72 sm:w-80 md:w-96 h-96 flex flex-col fade-in">
          <div className="flex justify-between items-center p-3 border-b">
            <span className="font-semibold">Support Chat</span>
            <button
              type="button"
              className="btn btn-xs btn-circle"
              onClick={toggle}
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1 text-sm">
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}
            <div ref={endRef} />
          </div>
          <ChatInput />
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-primary btn-circle"
          onClick={toggle}
        >
          <ChatIcon size={20} />
        </button>
      )}
    </div>
  );
};

export default ChatWindow;
