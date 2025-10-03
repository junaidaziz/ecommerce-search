import React from 'react';
import { Checkbox } from '../form-fields';
import CheckIcon from '../icons/CheckIcon';
import FilterSection from './FilterSection';

interface AvailabilityFilterProps {
  inStock: boolean;
  setInStock: React.Dispatch<React.SetStateAction<boolean>>;
}

const AvailabilityFilter: React.FC<AvailabilityFilterProps> = ({ inStock, setInStock }) => {
  return (
    <FilterSection 
      label="Availability" 
      icon={<CheckIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />}
    >
      <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
        <Checkbox
          label="In Stock Only"
          name="inStock"
          checked={inStock}
          onChange={(e) => setInStock(e.target.checked)}
          className="text-base font-medium text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary transition-colors duration-200 hover:bg-primary/5 dark:hover:bg-primary/10 rounded px-2 py-1"
        />
      </div>
    </FilterSection>
  );
};

export default AvailabilityFilter;
