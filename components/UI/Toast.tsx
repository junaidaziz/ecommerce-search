import React from 'react';

export interface ToastProps {
  message: React.ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => (
  <div
    role="alert"
    aria-live="assertive"
    className={`alert alert-${type} shadow-md relative`}
  >
    {message}
    <button type="button" className="absolute right-2 top-1" onClick={onClose}>
      ✕
    </button>
  </div>
);

export default Toast;
