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
      ? 'badge-success'
      : color === 'info'
      ? 'badge-info'
      : color === 'warning'
      ? 'badge-warning'
      : color === 'error'
      ? 'badge-error'
      : '';
  const sizeClass = size === 'sm' ? 'badge-sm' : '';
  return <span className={`badge ${sizeClass} ${colorClass} ${className}`}>{children}</span>;
};

export default StatusLabel;
