import React from 'react';

interface FormErrorProps {
  message?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

/**
 * Reusable component for displaying form-level error messages
 * Follows the design system with consistent styling
 */
const FormError: React.FC<FormErrorProps> = ({ 
  message, 
  align = 'left',
  className = '',
}) => {
  if (!message) return null;

  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return (
    <div 
      className={`text-red-500 dark:text-red-400 text-sm font-semibold ${alignmentClass} ${className}`}
      role="alert"
      aria-live="polite"
    >
      {message}
    </div>
  );
};

export default FormError;
