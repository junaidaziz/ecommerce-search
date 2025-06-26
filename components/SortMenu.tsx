import React from 'react';

export type SortValue = 'newest' | 'price_asc' | 'price_desc' | 'popularity';

interface SortMenuProps {
  value: SortValue;
  onChange: (v: SortValue) => void;
}

const SortMenu: React.FC<SortMenuProps> = ({ value, onChange }) => (
  <div className="mb-4 flex items-center gap-2">
    <label htmlFor="sort" className="font-medium">
      Sort by:
    </label>
    <select
      id="sort"
      className="select select-sm select-bordered"
      value={value}
      onChange={(e) => onChange(e.target.value as SortValue)}
    >
      <option value="newest">Newest</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="popularity">Popularity</option>
    </select>
  </div>
);

export default SortMenu;
