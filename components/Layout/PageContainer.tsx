import React, { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`w-full max-w-6xl mx-auto p-6 bg-base-100 rounded-lg shadow ${className}`}
    >
      {children}
    </div>
  );
};

export default PageContainer;
