import React, { createContext, useState, ReactNode, useEffect, useRef } from 'react';
import { apiFetch } from '@lib/api';

export interface ChatMessage {
  id: number;
  sender: 'user' | 'support';
  messageType: 'text' | 'image' | 'file';
  content?: string;
  fileUrl?: string;
  fileName?: string;
  timestamp: Date;
}

interface ChatContextValue {
  messages: ChatMessage[];
  isOpen: boolean;
  openChat: (context?: { orderId?: string; customerName?: string }) => void;
  closeChat: () => void;
  sendMessage: (data: {
    content?: string;
    messageType: 'text' | 'image' | 'file';
    fileUrl?: string;
    fileName?: string;
  }) => void;
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
  const [chatCtx, setChatCtx] = useState<
    | {
        orderId?: string;
        customerName?: string;
      }
    | undefined
  >();
  const eventSourceRef = useRef<EventSource | null>(null);

  // Initialize SSE connection when component mounts
  useEffect(() => {
    // Connect to SSE stream
    const connectSSE = () => {
      try {
        const eventSource = new EventSource('/api/chat/stream');
        
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          if (data.type === 'message') {
            setMessages((prev) => [...prev, data.data]);
          } else if (data.type === 'connected') {
            console.log('Connected to chat stream');
          }
        };
        
        eventSource.onerror = () => {
          console.error('SSE connection error, reconnecting...');
          eventSource.close();
          // Reconnect after 5 seconds
          setTimeout(connectSSE, 5000);
        };
        
        eventSourceRef.current = eventSource;
      } catch (error) {
        console.error('Failed to connect to SSE:', error);
      }
    };

    connectSSE();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const sendMessage = async (data: {
    content?: string;
    messageType: 'text' | 'image' | 'file';
    fileUrl?: string;
    fileName?: string;
  }) => {
    const msg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      messageType: data.messageType,
      content: data.content,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      timestamp: new Date(),
    };
    
    // Add message to local state immediately for instant feedback
    setMessages((prev) => [...prev, msg]);
    
    // Send to server
    try {
      await apiFetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const openChat = (context?: { orderId?: string; customerName?: string }) => {
    if (context) setChatCtx(context);
    setIsOpen(true);
  };

  const closeChat = () => setIsOpen(false);

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        isOpen,
        openChat,
        closeChat,
        context: chatCtx,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
