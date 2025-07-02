import React from 'react';

export type BrandProductSortValue =
  | 'title_asc'
  | 'title_desc'
  | 'category_asc'
  | 'category_desc'
  | 'status_asc'
  | 'status_desc'
  | 'quantity_asc'
  | 'quantity_desc';

interface BrandProductSortProps {
  value: BrandProductSortValue;
  onChange: (v: BrandProductSortValue) => void;
}

const BrandProductSort: React.FC<BrandProductSortProps> = ({
  value,
  onChange,
}) => (
  <div className="flex items-center gap-2">
    <label htmlFor="brand-sort" className="font-medium">
      Sort by:
    </label>
    <select
      id="brand-sort"
      className="select select-sm select-bordered"
      value={value}
      onChange={(e) => onChange(e.target.value as BrandProductSortValue)}
    >
      <option value="title_asc">Name (A-Z)</option>
      <option value="title_desc">Name (Z-A)</option>
      <option value="category_asc">Category (A-Z)</option>
      <option value="category_desc">Category (Z-A)</option>
      <option value="status_asc">Status (A-Z)</option>
      <option value="status_desc">Status (Z-A)</option>
      <option value="quantity_asc">Quantity (Low-High)</option>
      <option value="quantity_desc">Quantity (High-Low)</option>
    </select>
  </div>
);

export default BrandProductSort;
