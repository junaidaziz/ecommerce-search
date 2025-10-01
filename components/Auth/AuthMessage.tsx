import React from 'react';

interface AuthMessageProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  align?: 'left' | 'center' | 'right';
  className?: string;
}

/**
 * Reusable component for displaying various types of auth messages
 * (info, success, warning, error) with consistent design system styling
 */
const AuthMessage: React.FC<AuthMessageProps> = ({ 
  message, 
  type = 'info',
  align = 'left',
  className = '',
}) => {
  if (!message) return null;

  const typeClasses = {
    info: 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    success: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
    warning: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700',
    error: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700',
  }[type];

  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return (
    <div 
      className={`px-4 py-3 rounded-lg border text-sm ${typeClasses} ${alignmentClass} ${className}`}
      role="alert"
      aria-live="polite"
    >
      {message}
    </div>
  );
};

export default AuthMessage;
