import React from 'react';

interface ChartContainerProps {
  dataLength?: number;
  height?: string | number;
  children: React.ReactNode;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  dataLength = 0,
  height = '16rem',
  children,
}) => {
  return (
    <div className="relative" style={{ height }}>
      {dataLength === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm pointer-events-none">
          No data available
        </div>
      )}
      {children}
    </div>
  );
};

export default ChartContainer;
