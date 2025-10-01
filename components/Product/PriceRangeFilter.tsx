import React from 'react';
import InputField from '../UI/InputField';
import CurrencyDollarIcon from '../icons/CurrencyDollarIcon';
import FilterSection from './FilterSection';

interface PriceRangeFilterProps {
  minPrice: string;
  setMinPrice: React.Dispatch<React.SetStateAction<string>>;
  maxPrice: string;
  setMaxPrice: React.Dispatch<React.SetStateAction<string>>;
}

const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({ 
  minPrice, 
  setMinPrice, 
  maxPrice, 
  setMaxPrice 
}) => {
  return (
    <FilterSection 
      label="Price Range" 
      icon={<CurrencyDollarIcon className="w-4 h-4 text-yellow-500" />}
      className="py-2"
      noBorder
    >
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
              className="w-full text-base px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary dark:focus:border-primary transition-all duration-300 shadow-sm focus:shadow-lg"
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
              className="w-full text-base px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary dark:focus:border-primary transition-all duration-300 shadow-sm focus:shadow-lg"
            />
          </div>
        </div>
      </div>
    </FilterSection>
  );
};

export default PriceRangeFilter;
