import React from 'react';
import type { Category } from '@/types';
import Button from '../UI/Button';
import XMarkIcon from '../icons/XMarkIcon';
import SearchFilter from './SearchFilter';
import AvailabilityFilter from './AvailabilityFilter';
import CategoryFilter from './CategoryFilter';
import BrandFilter from './BrandFilter';
import PriceRangeFilter from './PriceRangeFilter';

interface ProductFiltersProps {
  keyword: string;
  setKeyword: React.Dispatch<React.SetStateAction<string>>;
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  selectedBrands: number[];
  setSelectedBrands: React.Dispatch<React.SetStateAction<number[]>>;
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
  selectedBrands,
  setSelectedBrands,
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
      className="space-y-5 p-4 md:p-4 bg-transparent"
    >
      {/* Search Keyword */}
      <SearchFilter keyword={keyword} setKeyword={setKeyword} />

      {/* In Stock Filter */}
      <AvailabilityFilter inStock={inStock} setInStock={setInStock} />

      {/* Categories */}
      <CategoryFilter 
        categories={categories} 
        selectedCategories={selectedCategories} 
        setSelectedCategories={setSelectedCategories} 
      />

      {/* Brands */}
      <BrandFilter 
        selectedBrands={selectedBrands} 
        setSelectedBrands={setSelectedBrands} 
      />

      {/* Price Range */}
      <PriceRangeFilter 
        minPrice={minPrice} 
        setMinPrice={setMinPrice} 
        maxPrice={maxPrice} 
        setMaxPrice={setMaxPrice} 
      />

      {/* Quick Actions */}
      <div className="pt-2">
        <Button
          type="button"
          onClick={clearAll}
          size="sm"
          fullWidth
          rounded
          className="justify-center gap-2 font-medium bg-base-200/70 dark:bg-gray-900/60 hover:bg-base-200 dark:hover:bg-gray-800 text-base-content/80 hover:text-base-content border border-base-300 dark:border-gray-700 shadow-sm"
        >
          <XMarkIcon className="w-4 h-4" />
          <span>Clear All</span>
        </Button>
      </div>
    </form>
  );
};

export default ProductFilters;
