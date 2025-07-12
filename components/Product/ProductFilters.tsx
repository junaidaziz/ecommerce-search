import React from 'react';
import type { Category } from '@/types';
import InputField from '../UI/InputField';
import { Checkbox } from '../form-fields';
import Button from '../UI/Button';

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
      className="space-y-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8"
    >
      {/* Search Keyword */}
      <div className="space-y-3">
        <label className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
          <svg className="w-4 h-4 mr-2 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          Search Products
        </label>
        <InputField
          type="text"
          placeholder="Search by name or description..."
          name="keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full text-base px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* In Stock Filter */}
      <div className="space-y-3">
        <label className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
          <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Availability
        </label>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <Checkbox
            label="In Stock Only"
            name="inStock"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
            className="text-base font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <label className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
          <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
          Categories
        </label>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 max-h-64 overflow-y-auto">
          <div className="space-y-2">
            {categories.map((c) => (
              <Checkbox
                key={c.slug}
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
                className="text-base font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1 transition-colors focus:ring-2 focus:ring-primary"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <label className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
          <svg className="w-4 h-4 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          Price Range
        </label>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Min Price</label>
              <InputField
                type="number"
                placeholder="£0"
                name="minPrice"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full text-base px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Max Price</label>
              <InputField
                type="number"
                placeholder="£1000"
                name="maxPrice"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full text-base px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
        <Button
          type="button"
          onClick={clearAll}
          variant="outline"
          size="md"
          fullWidth
          rounded
          className="font-semibold text-primary border-primary dark:text-primary-light dark:border-primary-light mt-2"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Clear All Filters
        </Button>
      </div>
    </form>
  );
};

export default ProductFilters;
