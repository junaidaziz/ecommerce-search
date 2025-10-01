import React, { useContext, useState } from 'react';
import { ChatContext } from '@contexts/ChatContext';
import ChatIcon from '../icons/ChatIcon';
import ChatInput from './ChatInput';
import MessageList from './MessageList';

const ChatWindow: React.FC = () => {
  const { messages, isOpen, openChat, closeChat } = useContext(ChatContext);
  const [isTyping, setIsTyping] = useState(false);

  const toggle = () => {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-base-100 rounded-lg shadow-lg border border-base-300 w-72 sm:w-80 md:w-96 h-96 flex flex-col fade-in">
          <div className="flex justify-between items-center p-3 border-b border-base-300 bg-primary text-white rounded-t-lg">
            <span className="font-semibold">Support Chat</span>
            <button
              type="button"
              className="btn btn-xs btn-circle btn-ghost text-white hover:bg-white/20"
              onClick={toggle}
            >
              ✕
            </button>
          </div>
          <MessageList messages={messages} isTyping={isTyping} />
          <ChatInput onTyping={setIsTyping} />
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-primary btn-circle shadow-lg hover:shadow-xl transition-shadow"
          onClick={toggle}
          title="Open Support Chat"
        >
          <ChatIcon size={20} />
        </button>
      )}
    </div>
  );
};

export default ChatWindow;
