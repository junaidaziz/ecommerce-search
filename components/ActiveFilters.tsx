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
          className="inline-flex items-center px-3 py-1.5 bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 rounded-full text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          <span>{f.label}</span>
          <button
            type="button"
            onClick={() => f.clear()}
            className="ml-2 p-0.5 rounded-full hover:bg-rose-500 hover:text-white transition-colors"
            aria-label={`Remove ${f.label} filter`}
          >
            <XMarkIcon className="w-3.5 h-3.5" />
          </button>
        </span>
      ))}
      {filters.length > 1 && (
        <button
          type="button"
          onClick={clearAll}
          className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary dark:text-primary-light rounded-full hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors border border-primary/20 dark:border-primary/30"
        >
          <XMarkIcon className="w-3.5 h-3.5" />
          Clear All
        </button>
      )}
    </div>
  );
};

export default ActiveFilters;
