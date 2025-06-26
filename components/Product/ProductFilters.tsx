import React from 'react';
import type { Category } from '../../types/category';
import InputField from '../UI/InputField';
import { Checkbox } from '../form-fields';

interface ProductFiltersProps {
  keyword: string;
  setKeyword: React.Dispatch<React.SetStateAction<string>>;
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  minPrice: string;
  setMinPrice: React.Dispatch<React.SetStateAction<string>>;
  maxPrice: string;
  setMaxPrice: React.Dispatch<React.SetStateAction<string>>;
  inStock: boolean;
  setInStock: React.Dispatch<React.SetStateAction<boolean>>;
  categories: Category[];
  clearAll: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  keyword,
  setKeyword,
  selectedCategories,
  setSelectedCategories,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  inStock,
  setInStock,
  categories,
  clearAll,
}) => {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="space-y-4 sticky top-4"
    >
      <Checkbox
        label="In Stock Only"
        name="inStock"
        checked={inStock}
        onChange={(e) => setInStock(e.target.checked)}
      />
      <details open className="collapse bg-base-100 rounded-box">
        <summary className="collapse-title font-medium">Category</summary>
        <div className="collapse-content max-h-48 overflow-y-auto">
          {categories.map((c) => (
            <Checkbox
              key={c.slug}
              className="mb-1"
              label={c.name}
              name={`cat-${c.slug}`}
              checked={selectedCategories.includes(c.slug || '')}
              onChange={(e) => {
                const slug = c.slug || '';
                setSelectedCategories((prev) =>
                  e.target.checked
                    ? [...prev, slug]
                    : prev.filter((s) => s !== slug)
                );
              }}
            />
          ))}
        </div>
      </details>
      <details className="collapse bg-base-100 rounded-box">
        <summary className="collapse-title font-medium">Price Range</summary>
        <div className="collapse-content space-y-2">
          <div className="flex items-center gap-2">
            <InputField
              type="number"
              placeholder="Min"
              name="minPrice"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <span>-</span>
            <InputField
              type="number"
              placeholder="Max"
              name="maxPrice"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>
      </details>
      <details className="collapse bg-base-100 rounded-box">
        <summary className="collapse-title font-medium">Keyword</summary>
        <div className="collapse-content">
          <InputField
            type="text"
            placeholder="Search name"
            name="keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </details>
      <div className="flex justify-end">
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          onClick={clearAll}
        >
          Clear All
        </button>
      </div>
    </form>
  );
};

export default ProductFilters;
