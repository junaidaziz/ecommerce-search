import { apiFetch } from '@lib/api';
import React, { useState, useContext, ChangeEvent, useEffect } from 'react';
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
  onTyping?: (isTyping: boolean) => void;
}

const ChatInput: React.FC<Props> = ({ onSend, onTyping }) => {
  const { sendMessage } = useContext(ChatContext);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  // Notify parent about typing status
  useEffect(() => {
    if (onTyping) {
      const isTyping = text.trim().length > 0;
      onTyping(isTyping);
    }
  }, [text, onTyping]);

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
    if (isUploading) return;
    
    let messageType: 'text' | 'image' | 'file' = 'text';
    let fileUrl: string | undefined;
    let fileName: string | undefined;
    
    if (file) {
      messageType = file.type.startsWith('image/') ? 'image' : 'file';
      const formData = new FormData();
      formData.append('file', file);
      
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate progress for better UX (real progress would require XHR)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);
      
      try {
        const res = await apiFetch('/api/chat/upload', {
          method: 'POST',
          body: formData,
        });
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        if (res.ok) {
          const data = await res.json();
          fileUrl = data.url;
          fileName = file.name;
        } else {
          alert('Failed to upload file');
          setIsUploading(false);
          setUploadProgress(0);
          return;
        }
      } catch (error) {
        clearInterval(progressInterval);
        alert('Failed to upload file');
        setIsUploading(false);
        setUploadProgress(0);
        return;
      } finally {
        setIsUploading(false);
      }
    }
    
    const fn = onSend || sendMessage;
    fn({ content: text.trim(), messageType, fileUrl, fileName });
    setText('');
    setFile(null);
    setPreview(null);
    setUploadProgress(0);
  };

  return (
    <div className="p-3 border-t border-base-300">
      {isUploading && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-base-content/60 mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-base-300 rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
      <div className="flex gap-2 items-center">
        <input id="chat-file" type="file" hidden onChange={onFileChange} disabled={isUploading} />
        <label
          htmlFor="chat-file"
          className={`btn btn-square btn-sm ${isUploading ? 'btn-disabled' : ''}`}
          title="Attach a file or image"
        >
          <PaperClipIcon size={16} />
        </label>
        {preview && (
          <div className="relative">
            <img
              src={preview}
              alt="preview"
              className="w-8 h-8 object-cover rounded"
            />
            {!isUploading && (
              <button
                type="button"
                className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white rounded-full text-xs flex items-center justify-center hover:bg-danger/80"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
              >
                ×
              </button>
            )}
          </div>
        )}
        {file && !preview && (
          <div className="text-xs text-base-content/60 flex items-center gap-1">
            <span>{file.name}</span>
            {!isUploading && (
              <button
                type="button"
                className="text-danger hover:text-danger/80"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
              >
                ×
              </button>
            )}
          </div>
        )}
        <input
          className="input input-bordered flex-1 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && submit()}
          placeholder="Type a message…"
          disabled={isUploading}
        />
        <button 
          type="button" 
          className="btn btn-primary btn-sm" 
          onClick={submit}
          disabled={isUploading || (!text.trim() && !file)}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
