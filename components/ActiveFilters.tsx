import React from 'react';
import type { ActiveFilter } from '@/types/shared';
import XMarkIcon from '@components/icons/XMarkIcon';

interface ActiveFiltersProps {
  filters: ActiveFilter[];
  clearAll: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({ filters, clearAll }) => {
  if (filters.length === 0) return null;
  
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((f, i) => (
        <span 
          key={i} 
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium hover:bg-primary/20 transition-all duration-200 group"
        >
          <span>{f.label}</span>
          <button
            type="button"
            onClick={() => f.clear()}
            className="ml-1 p-0.5 rounded-full hover:bg-primary/20 transition-colors duration-200 group-hover:scale-110"
            aria-label={`Remove ${f.label} filter`}
          >
            <XMarkIcon className="w-3 h-3" fill="currentColor" />
          </button>
        </span>
      ))}
      {filters.length > 1 && (
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-base-content/60 hover:text-base-content border border-base-300 rounded-full hover:bg-base-200 transition-all duration-200"
        >
          <XMarkIcon className="w-3 h-3" fill="currentColor" />
          Clear All
        </button>
      )}
    </div>
  );
};

export default ActiveFilters;
