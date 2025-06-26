import React from 'react';

interface Props {
  title: string;
  loading?: boolean;
  error?: string;
  children?: React.ReactNode;
  className?: string;
}

const DashboardCard: React.FC<Props> = ({
  title,
  loading = false,
  error,
  children,
  className = '',
}) => {
  return (
    <div className={`border rounded-lg shadow p-4 bg-base-100 ${className}`}>
      \<h3 className="font-semibold mb-2">{title}</h3>
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
