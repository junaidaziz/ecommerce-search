import React from 'react';

interface Props {
  title: string;
  loading?: boolean;
  error?: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const DashboardCard: React.FC<Props> = ({
  title,
  loading = false,
  error,
  children,
  className = '',
  onClick,
}) => {
  return (
    <div
      className={`border rounded-lg shadow p-4 bg-base-100 transition-shadow duration-200 hover:shadow-md ${onClick ? 'cursor-pointer hover:bg-base-200' : ''} ${className}`}
      onClick={onClick}
    >
      <h3 className="font-semibold mb-2">{title}</h3>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        children
      )}
    </div>
  );
};

export default DashboardCard;
