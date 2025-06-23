import React from 'react';

interface LoaderProps {
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ className = '' }) => (
  <div className={`flex items-center justify-center w-full h-full ${className}`}>
    <span className="loading loading-spinner" />
  </div>
);

export default Loader;
