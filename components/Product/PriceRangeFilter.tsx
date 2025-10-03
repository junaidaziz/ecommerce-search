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
      icon={<CurrencyDollarIcon className="w-4 h-4 text-amber-500 dark:text-amber-400" />}
      className="py-2"
      noBorder
    >
      <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block font-medium">Min Price</label>
            <InputField
              type="number"
              placeholder="£0"
              name="minPrice"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary focus:border-primary dark:focus:border-primary transition-all duration-200"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block font-medium">Max Price</label>
            <InputField
              type="number"
              placeholder="£1000"
              name="maxPrice"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary focus:border-primary dark:focus:border-primary transition-all duration-200"
            />
          </div>
        </div>
      </div>
    </FilterSection>
  );
};

export default PriceRangeFilter;
