import React from 'react';

interface FormErrorProps {
  message: string;
}

const FormError: React.FC<FormErrorProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div 
      role="alert"
      className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-left"
    >
      <div className="flex items-start">
        <svg 
          className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" 
          fill="currentColor" 
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path 
            fillRule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
            clipRule="evenodd" 
          />
        </svg>
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          {message}
        </p>
      </div>
    </div>
  );
};

export default FormError;
