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
      className={`border rounded-lg shadow p-4 bg-base-100 transition-shadow duration-200 hover:shadow-lg ${onClick ? 'cursor-pointer hover:bg-base-200' : ''} ${className}`}
      onClick={onClick}
    >
      <h3 className="font-semibold mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
        {trend && (
          <span className="text-xs font-normal text-gray-500">{trend}</span>
        )}
      </h3>
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-base-300 rounded w-3/4" />
          <div className="h-3 bg-base-300 rounded w-1/2" />
        </div>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        children
      )}
    </div>
  );
};

export default DashboardCard;
