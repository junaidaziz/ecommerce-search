import React, { useContext, useEffect, useRef, useState } from 'react';
import { ChatContext } from '@contexts/ChatContext';
import ChatIcon from './icons/ChatIcon';

const ChatWidget: React.FC = () => {
  const { messages, sendMessage } = useContext(ChatContext);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  const toggle = () => setOpen((o) => !o);

  const submit = () => {
    if (!text.trim()) return;
    sendMessage(text.trim());
    setText('');
  };

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="bg-base-100 rounded-lg shadow-lg w-72 h-96 flex flex-col fade-in">
          <div className="flex justify-between items-center p-2 border-b">
            <span className="font-semibold">Support Chat</span>
            <button type="button" className="btn btn-xs btn-circle" onClick={toggle}>
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 text-sm">
            {messages.map((m) => (
              <div key={m.id}>
                <span className="text-gray-500 mr-2">
                  {m.sender === 'user' ? 'You' : 'Support'}:
                </span>
                <span>{m.content}</span>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="p-2 border-t flex gap-2">
            <input
              className="input input-bordered flex-1"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="Type a message"
            />
            <button type="button" className="btn btn-primary" onClick={submit}>
              Send
            </button>
          </div>
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

export default ChatWidget;
