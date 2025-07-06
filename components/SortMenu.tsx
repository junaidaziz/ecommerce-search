import React from 'react';

export type SortValue = 'newest' | 'price_asc' | 'price_desc' | 'popularity';

interface SortMenuProps {
  value: SortValue;
  onChange: (v: SortValue) => void;
}

const SortMenu: React.FC<SortMenuProps> = ({ value, onChange }) => (
  <div className="flex items-center gap-3">
    <label htmlFor="sort" className="text-sm font-semibold text-base-content flex items-center">
      <svg className="w-4 h-4 mr-2 text-primary" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
      </svg>
      Sort by:
    </label>
    <select
      id="sort"
      className="select select-sm select-bordered bg-base-100 border-base-300 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
      value={value}
      onChange={(e) => onChange(e.target.value as SortValue)}
    >
      <option value="newest">Newest First</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="popularity">Most Popular</option>
    </select>
  </div>
);

export default SortMenu;
