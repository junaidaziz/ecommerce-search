import React from 'react';
import type { TableColumn } from './TableHeader';

interface TableBodyProps<T> {
  data: T[];
  columns: TableColumn[];
  renderRow: (row: T, idx: number) => React.ReactNode;
  emptyMessage?: string;
}

function TableBody<T>({ data, columns, renderRow, emptyMessage = 'No data found.' }: TableBodyProps<T>) {
  return (
    <tbody>
      {data.length === 0 ? (
        <tr>
          <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-400 dark:text-gray-500">{emptyMessage}</td>
        </tr>
      ) : (
        data.map((row, idx) => (
          <tr
            key={idx}
            className={`transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-950'} border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800`}
          >
            {renderRow(row, idx)}
          </tr>
        ))
      )}
    </tbody>
  );
}

export default TableBody; 