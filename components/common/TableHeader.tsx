import React from 'react';

export interface TableColumn {
  label: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface TableHeaderProps {
  columns: TableColumn[];
}

const TableHeader: React.FC<TableHeaderProps> = ({ columns }) => (
  <thead>
    <tr className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
      {columns.map((col, idx) => (
        <th
          key={col.label + idx}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 ${col.align ? `text-${col.align}` : 'text-left'} ${col.className || ''}`}
        >
          {col.label}
        </th>
      ))}
    </tr>
  </thead>
);

export default TableHeader; 