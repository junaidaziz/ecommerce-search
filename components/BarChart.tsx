import React from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  data?: DataPoint[];
  height?: number;
}

const BarChart: React.FC<BarChartProps> = ({ data = [], height = 200 }) => {
  const max = data.reduce((m, d) => Math.max(m, d.value), 0);

  return (
    <div className="relative border p-2 bg-base-100" style={{ height }}>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          No Data Available
        </div>
      ) : (
        <div className="flex items-end h-full space-x-1">
          {data.map((d) => (
            <div key={d.label} className="flex-1 flex flex-col items-center">
              <div
                className="bg-primary w-full"
                style={{ height: `${(d.value / max) * 100}%` }}
              />
              <span className="text-xs mt-1 truncate" title={d.label}>
                {d.label}
              </span>
            </div>
          ))}
        </div>
      )}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <line x1="32" y1="0" x2="32" y2="100%" stroke="#ccc" strokeWidth="1" />
        <line
          x1="32"
          y1="100%"
          x2="100%"
          y2="100%"
          stroke="#ccc"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
};

export default BarChart;
