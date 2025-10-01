import React from 'react';
import Button from './Button';

interface SocialButtonProps {
  icon: React.ReactNode;
  provider: 'Google' | 'Facebook' | 'GitHub';
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
}

const SocialButton: React.FC<SocialButtonProps> = ({ 
  icon, 
  provider, 
  onClick, 
  className = '',
  children 
}) => {
  const isGoogle = provider === 'Google';
  const isFacebook = provider === 'Facebook';
  const isGitHub = provider === 'GitHub';

  // Provider-specific styles
  const getProviderStyles = () => {
    if (isGoogle) {
      return `
        border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-800
        text-gray-700 dark:text-gray-300
        hover:bg-[#f8f9fa] dark:hover:bg-[#1a1a1a]
        hover:border-[#4285F4] dark:hover:border-[#4285F4]
        hover:shadow-[0_2px_8px_rgba(66,133,244,0.15)]
        hover:text-[#4285F4] dark:hover:text-[#4285F4]
        focus:ring-[#4285F4] focus:ring-opacity-20
        transition-all duration-300 ease-in-out
      `;
    }
    
    if (isFacebook) {
      return `
        border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-800
        text-gray-700 dark:text-gray-300
        hover:bg-[#1877F2] hover:text-white
        hover:border-[#1877F2]
        hover:shadow-[0_2px_8px_rgba(24,119,242,0.25)]
        focus:ring-[#1877F2] focus:ring-opacity-20
        transition-all duration-300 ease-in-out
      `;
    }
    
    if (isGitHub) {
      return `
        border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-800
        text-gray-700 dark:text-gray-300
        hover:bg-[#24292e] dark:hover:bg-[#0d1117]
        hover:text-white dark:hover:text-white
        hover:border-[#24292e] dark:hover:border-[#58a6ff]
        hover:shadow-[0_2px_8px_rgba(36,41,46,0.2)] dark:hover:shadow-[0_2px_8px_rgba(88,166,255,0.15)]
        focus:ring-[#24292e] dark:focus:ring-[#58a6ff] focus:ring-opacity-20
        transition-all duration-300 ease-in-out
      `;
    }
    
    return '';
  };

  return (
    <Button
      type="button"
      onClick={onClick}
      variant="outline"
      size="md"
      fullWidth
      rounded
      className={`
        flex items-center justify-center gap-3 
        font-semibold text-base
        hover:scale-[1.02] active:scale-[0.98]
        ${getProviderStyles()}
        ${className}
      `}
    >
      {icon}
      <span>{children || `Continue with ${provider}`}</span>
    </Button>
  );
};

export default SocialButton; 