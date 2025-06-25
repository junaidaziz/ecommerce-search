import React from 'react';
import type { ActiveFilter } from '../types/shared';

interface ActiveFiltersProps {
  filters: ActiveFilter[];
  clearAll: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({ filters, clearAll }) => {
  if (filters.length === 0) return null;
  return (
    <div className="mb-4 flex flex-wrap gap-2 items-center">
      {filters.map((f, i) => (
        <span key={i} className="badge badge-outline gap-1">
          {f.label}
          <button type="button" className="ml-1" onClick={() => f.clear()}>
            ✕
          </button>
        </span>
      ))}
      <button
        type="button"
        className="btn btn-sm btn-ghost ml-2"
        onClick={clearAll}
      >
        Clear All
      </button>
    </div>
  );
};

export default ActiveFilters;
