import React, { ReactNode } from 'react';

interface AuthCardProps {
  children: ReactNode;
  icon: ReactNode;
  title: string;
  subtitle: string;
  iconBgClass?: string;
}

const AuthCard: React.FC<AuthCardProps> = ({
  children,
  icon,
  title,
  subtitle,
  iconBgClass = 'bg-blue-100',
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-8 px-4 animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 sm:p-10 relative z-10">
        <div className="flex flex-col items-center mb-6">
          <div className={`w-14 h-14 flex items-center justify-center rounded-full mb-3 ${iconBgClass}`}>
            {icon}
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">{title}</h1>
          <p className="text-gray-500 dark:text-gray-300 text-center text-base">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthCard;
