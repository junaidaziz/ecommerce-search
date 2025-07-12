import React from 'react';
import type { Category } from '@/types';
import InputField from '../UI/InputField';
import { Checkbox } from '../form-fields';
import Button from '../UI/Button';
import SearchIcon from '../icons/SearchIcon';
import CheckIcon from '../icons/CheckIcon';
import TagIcon from '../icons/TagIcon';
import CurrencyDollarIcon from '../icons/CurrencyDollarIcon';
import XMarkIcon from '../icons/XMarkIcon';

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
      className="space-y-2 p-4 md:p-4"
    >
      {/* Search Keyword */}
      <div className="space-y-3">
        <label className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
          <SearchIcon className="w-4 h-4 mr-2 text-primary" />
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
          <CheckIcon className="w-4 h-4 mr-2 text-green-500" />
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
          <TagIcon className="w-4 h-4 mr-2 text-blue-500" />
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
          <CurrencyDollarIcon className="w-4 h-4 mr-2 text-yellow-500" />
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
          <XMarkIcon className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      </div>
    </form>
  );
};

export default ProductFilters;
