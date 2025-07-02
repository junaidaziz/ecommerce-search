import React, { useEffect, useState, useRef, useContext } from 'react';
import ChatInput from './ChatInput';
import { AppContext } from '@contexts/AppContext';
import type { Message } from '@/types';

interface Props {
  orderId: string;
  brandName: string;
  brandLogo?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderChatWindow: React.FC<Props> = ({
  orderId,
  brandName,
  brandLogo,
  isOpen,
  onClose,
}) => {
  const app = useContext(AppContext);
  const user = app?.user;
  const [messages, setMessages] = useState<Message[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);

  const fetchMsgs = () => {
    if (!orderId) return;
    fetch(`/api/messages/${orderId}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMessages(data))
      .catch(() => {});
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchMsgs();
    const i = setInterval(fetchMsgs, 5000);
    return () => clearInterval(i);
  }, [isOpen, orderId]);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const send = async (data: {
    content?: string;
    messageType: 'text' | 'image' | 'file';
    fileUrl?: string;
    fileName?: string;
  }) => {
    await fetch(`/api/messages/${orderId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((res) => res.ok && res.json()).catch(() => {});
    fetchMsgs();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-base-100 rounded-lg shadow-lg w-72 h-96 flex flex-col fade-in">
        <div className="flex justify-between items-center p-2 border-b">
          <div className="flex items-center gap-2">
            {brandLogo && (
              <img src={brandLogo} alt={brandName} className="w-6 h-6 rounded" />
            )}
            <span className="font-semibold">{brandName}</span>
          </div>
          <button type="button" className="btn btn-xs btn-circle" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="p-1 text-xs text-center text-gray-500">
          You are chatting with {brandName}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 text-sm">
          {messages.map((m) => (
            <div key={m.id}>
              <span className="text-gray-500 mr-2">
                {m.senderId === user?.id ? 'You' : brandName}:
              </span>
              {m.messageType === 'image' && m.fileUrl ? (
                <img
                  src={m.fileUrl}
                  alt={m.fileName || 'image'}
                  className="max-w-[150px] rounded inline"
                />
              ) : m.messageType === 'file' && m.fileUrl ? (
                <a href={m.fileUrl} target="_blank" rel="noopener" className="link">
                  {m.fileName || 'Download file'}
                </a>
              ) : (
                <span>{m.content}</span>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <ChatInput onSend={send} />
      </div>
    </div>
  );
};

export default OrderChatWindow;
