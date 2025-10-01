import React from 'react';

interface Props {
  title: string;
  loading?: boolean;
  error?: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  trend?: string;
}

const DashboardCard: React.FC<Props> = ({
  title,
  loading = false,
  error,
  children,
  className = '',
  onClick,
  icon,
  trend,
}) => {
  return (
    <div
      className={`bg-card-light dark:bg-card-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark p-6 transition-all duration-300 hover:shadow-xl ${onClick ? 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex-shrink-0">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {title}
          </h3>
        </div>
        {trend && (
          <span className="text-sm font-medium text-neutral dark:text-neutral-400">
            {trend}
          </span>
        )}
      </div>
      
      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-danger dark:text-danger-light">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <div className="text-neutral-900 dark:text-white">
          {children}
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
