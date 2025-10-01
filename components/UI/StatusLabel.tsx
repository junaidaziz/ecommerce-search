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
      ? 'bg-success-100 text-success-dark dark:bg-success-dark/30 dark:text-success-light'
      : color === 'info'
        ? 'bg-info-light/20 text-info-dark dark:bg-info-dark/30 dark:text-info-light'
        : color === 'warning'
          ? 'bg-warning-100 text-warning-dark dark:bg-warning-dark/30 dark:text-warning-light'
          : color === 'error'
            ? 'bg-danger-100 text-danger-dark dark:bg-danger-dark/30 dark:text-danger-light'
            : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-dark/30 dark:text-neutral-light';
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
