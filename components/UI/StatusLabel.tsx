import React from 'react';

interface StatusLabelProps {
  color?: 'default' | 'success' | 'info' | 'warning' | 'error';
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

const StatusLabel: React.FC<StatusLabelProps> = ({
  color = 'default',
  children,
  className = '',
  size = 'md',
}) => {
  const colorClass =
    color === 'success'
      ? 'bg-green-100 text-green-800'
      : color === 'info'
        ? 'bg-blue-100 text-blue-800'
        : color === 'warning'
          ? 'bg-yellow-100 text-yellow-800'
          : color === 'error'
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-800';
  const sizeClass = size === 'sm' ? 'text-xs' : 'text-sm';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium ${sizeClass} ${colorClass} ${className}`}
    >
      {children}
    </span>
  );
};

export default StatusLabel;
