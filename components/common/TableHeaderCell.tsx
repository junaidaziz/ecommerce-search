import React from 'react';
import { clsx } from 'clsx';

export interface TableHeaderCellProps {
  title: string | React.ReactNode;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
  className?: string;
  filter?: React.ReactNode; // optional filter control (dropdown, input, etc.)
  ariaLabel?: string; // accessible label override
  hideTitleVisually?: boolean; // allow icon-only with accessible text
}

const baseClasses = 'px-6 py-3 text-xs font-medium uppercase tracking-wider select-none';

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  title,
  align = 'left',
  sortable = false,
  sortDirection = null,
  onSort,
  className = '',
  filter,
  ariaLabel,
  hideTitleVisually = false,
}) => {
  const clickable = sortable && !!onSort;
  return (
    <th
      scope="col"
      className={clsx(
        baseClasses,
        'text-gray-500 dark:text-gray-400',
        `text-${align}`,
        clickable && 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors',
        className
      )}
    >
      <div className={clsx('flex items-center gap-1', align === 'right' && 'justify-end', align === 'center' && 'justify-center')}>
        <button
          type={clickable ? 'button' : 'button'}
          onClick={clickable ? onSort : undefined}
          disabled={!clickable}
          className={clsx('inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 rounded', !clickable && 'cursor-default')}
          aria-label={ariaLabel || (typeof title === 'string' ? title : undefined)}
        >
          <span className={clsx(hideTitleVisually && 'sr-only')}>{title}</span>
          {sortable && (
            <span aria-hidden className="text-[10px] leading-none opacity-70">
              {sortDirection === 'asc' && '▲'}
              {sortDirection === 'desc' && '▼'}
              {sortDirection === null && '↕'}
            </span>
          )}
        </button>
        {filter && <div className="ml-1">{filter}</div>}
      </div>
    </th>
  );
};

export default TableHeaderCell;