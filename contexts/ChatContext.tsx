import React, { createContext, useState, ReactNode } from 'react';

export interface ChatMessage {
  id: number;
  sender: 'user' | 'support';
  content: string;
  timestamp: Date;
}

interface ChatContextValue {
  messages: ChatMessage[];
  isOpen: boolean;
  openChat: (context?: { orderId?: string; customerName?: string }) => void;
  closeChat: () => void;
  sendMessage: (content: string) => void;
  context?: {
    orderId?: string;
    customerName?: string;
  };
}

export const ChatContext = createContext<ChatContextValue>({
  messages: [],
  isOpen: false,
  openChat: () => {},
  closeChat: () => {},
  sendMessage: () => {},
});

interface ProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ProviderProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [chatCtx, setChatCtx] = useState<{
    orderId?: string;
    customerName?: string;
  } | undefined>();
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

  const openChat = (context?: { orderId?: string; customerName?: string }) => {
    if (context) setChatCtx(context);
    setIsOpen(true);
  };

  const closeChat = () => setIsOpen(false);

  return (
    <ChatContext.Provider
      value={{ messages, sendMessage, isOpen, openChat, closeChat, context: chatCtx }}
    >
      {children}
    </ChatContext.Provider>
  );
}
