import React from 'react';
import type { ActiveFilter } from '@/types';

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
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </span>
      ))}
      {filters.length > 1 && (
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-base-content/60 hover:text-base-content border border-base-300 rounded-full hover:bg-base-200 transition-all duration-200"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Clear All
        </button>
      )}
    </div>
  );
};

export default ActiveFilters;
