import React, { createContext, useState, ReactNode } from 'react';

export interface ChatMessage {
  id: number;
  sender: 'user' | 'support';
  content: string;
  timestamp: Date;
}

interface ChatContextValue {
  messages: ChatMessage[];
  sendMessage: (content: string) => void;
}

export const ChatContext = createContext<ChatContextValue>({
  messages: [],
  sendMessage: () => {},
});

interface ProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ProviderProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const sendMessage = (content: string) => {
    const msg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, msg]);
    // Simulate support reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'support',
          content: 'Thanks for your message! We\'ll get back to you shortly.',
          timestamp: new Date(),
        },
      ]);
    }, 1000);
  };
  return (
    <ChatContext.Provider value={{ messages, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
}
