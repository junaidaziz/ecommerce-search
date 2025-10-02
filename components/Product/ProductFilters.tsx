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
      className="space-y-6 p-4 md:p-4"
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
      <div className="pt-1">
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
