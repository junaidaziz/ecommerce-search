import React from 'react';

interface SocialButtonProps {
  icon: React.ReactNode;
  provider: 'Google' | 'Facebook' | 'GitHub' | 'Twitter';
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
  const isTwitter = provider === 'Twitter';

  // Provider-specific styles
  const getProviderStyles = () => {
    if (isGoogle) {
      return `
        border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-800
        text-gray-700 dark:text-gray-300
        hover:bg-[#DB4437] dark:hover:bg-[#DB4437]
        hover:border-[#DB4437] dark:hover:border-[#DB4437]
        hover:text-white dark:hover:text-white
        hover:shadow-[0_2px_8px_rgba(219,68,55,0.25)]
        focus:ring-[#DB4437] focus:ring-opacity-20
        transition-all duration-300 ease-in-out
      `;
    }
    
    if (isFacebook) {
      return `
        border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-800
        text-gray-700 dark:text-gray-300
        hover:bg-[#1877F2] dark:hover:bg-[#1877F2]
        hover:border-[#1877F2] dark:hover:border-[#1877F2]
        hover:text-white dark:hover:text-white
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
        hover:bg-[#000000] dark:hover:bg-[#000000]
        hover:border-[#000000] dark:hover:border-[#000000]
        hover:text-white dark:hover:text-white
        hover:shadow-[0_2px_8px_rgba(0,0,0,0.2)]
        focus:ring-[#000000] focus:ring-opacity-20
        transition-all duration-300 ease-in-out
      `;
    }

    if (isTwitter) {
      return `
        border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-800
        text-gray-700 dark:text-gray-300
        hover:bg-[#1DA1F2] dark:hover:bg-[#1DA1F2]
        hover:border-[#1DA1F2] dark:hover:border-[#1DA1F2]
        hover:text-white dark:hover:text-white
        hover:shadow-[0_2px_8px_rgba(29,161,242,0.25)]
        focus:ring-[#1DA1F2] focus:ring-opacity-20
        transition-all duration-300 ease-in-out
      `;
    }
    
    return '';
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-3 
        w-full px-4 py-2 rounded-full
        font-semibold text-base
        border
        hover:scale-[1.02] active:scale-[0.98]
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-60 disabled:pointer-events-none
        ${getProviderStyles()}
        ${className}
      `}
    >
      {icon}
      <span>{children || `Continue with ${provider}`}</span>
    </button>
  );
};

export default SocialButton; 