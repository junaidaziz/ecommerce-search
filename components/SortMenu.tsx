import React from 'react';
import SortIcon from './icons/SortIcon';

export type SortValue = 'newest' | 'price_asc' | 'price_desc' | 'popularity';

interface SortMenuProps {
  value: SortValue;
  onChange: (v: SortValue) => void;
}

const SortMenu: React.FC<SortMenuProps> = ({ value, onChange }) => (
  <div className="flex items-center gap-3">
    <label htmlFor="sort" className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center">
      <SortIcon className="w-4 h-4 mr-2 text-primary dark:text-primary-light" />
      Sort by:
    </label>
    <select
      id="sort"
      className="w-48 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 py-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:border-primary transition-all duration-200 shadow-sm cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
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
