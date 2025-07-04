import { apiFetch } from '@lib/api';
import React, { useState, useContext, ChangeEvent } from 'react';
import { ChatContext } from '@contexts/ChatContext';
import PaperClipIcon from '../icons/PaperClipIcon';

const allowedTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

interface Props {
  onSend?: (data: {
    content?: string;
    messageType: 'text' | 'image' | 'file';
    fileUrl?: string;
    fileName?: string;
  }) => void;
}

const ChatInput: React.FC<Props> = ({ onSend }) => {
  const { sendMessage } = useContext(ChatContext);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB');
      return;
    }
    if (f.type && !allowedTypes.includes(f.type)) {
      alert('Invalid file type');
      return;
    }
    setFile(f);
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  };

  const submit = async () => {
    if (!text.trim() && !file) return;
    let messageType: 'text' | 'image' | 'file' = 'text';
    let fileUrl: string | undefined;
    let fileName: string | undefined;
    if (file) {
      messageType = file.type.startsWith('image/') ? 'image' : 'file';
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiFetch('/api/chat/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        fileUrl = data.url;
        fileName = file.name;
      }
    }
    const fn = onSend || sendMessage;
    fn({ content: text.trim(), messageType, fileUrl, fileName });
    setText('');
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="p-3 border-t flex gap-2 items-center">
      <input id="chat-file" type="file" hidden onChange={onFileChange} />
      <label
        htmlFor="chat-file"
        className="btn btn-square btn-sm"
        title="Attach a file or image"
      >
        <PaperClipIcon size={16} />
      </label>
      {preview && (
        <img
          src={preview}
          alt="preview"
          className="w-8 h-8 object-cover rounded"
        />
      )}
      <input
        className="input input-bordered flex-1 focus:outline-none focus:ring-2 focus:ring-primary"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Type a message…"
      />
      <button type="button" className="btn btn-primary" onClick={submit}>
        Send
      </button>
    </div>
  );
};

export default ChatInput;
