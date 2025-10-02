import React from 'react';
import type { ActiveFilter } from '@/types';
import XMarkIcon from '@components/icons/XMarkIcon';

interface ActiveFiltersProps {
  filters: ActiveFilter[];
  clearAll: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({ filters, clearAll }) => {
  if (filters.length === 0) return null;
  
  return (
    <div className="flex flex-wrap items-center gap-2 max-w-full">
      {filters.map((f, i) => (
        <span
          key={i}
          className="inline-flex items-center px-3 py-1 bg-zinc-200 dark:bg-zinc-700 rounded-full text-sm text-zinc-800 dark:text-zinc-100"
        >
          <span>{f.label}</span>
          <button
            type="button"
            onClick={() => f.clear()}
            className="ml-2 p-1 rounded-full hover:bg-red-600 hover:text-white transition-colors"
            aria-label={`Remove ${f.label} filter`}
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        </span>
      ))}
      {filters.length > 1 && (
        <button
          type="button"
          onClick={clearAll}
          className="ml-2 inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-zinc-600 transition-colors"
        >
          <XMarkIcon className="w-3 h-3" />
          Clear All
        </button>
      )}
    </div>
  );
};

export default ActiveFilters;
