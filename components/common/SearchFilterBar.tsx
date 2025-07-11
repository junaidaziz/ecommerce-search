import React from 'react';
import SelectDropdown, { SelectOption } from '@components/form-fields/SelectDropdown';

interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  filterValue: SelectOption;
  filterOptions: SelectOption[];
  onFilterChange: (option: SelectOption | null) => void;
  placeholder?: string;
  buttonText?: string;
  className?: string;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchValue,
  onSearchChange,
  onSearchSubmit,
  filterValue,
  filterOptions,
  onFilterChange,
  placeholder = 'Search...',
  buttonText = 'Search',
  className = '',
}) => {
  return (
    <div className={`bg-gray-50 dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col md:flex-row gap-4 items-center justify-between ${className}`}>
      <form onSubmit={onSearchSubmit} className="w-full md:w-auto flex-1">
        <div className="flex flex-row items-stretch gap-2 w-full">
          <input
            type="text"
            value={searchValue}
            onChange={onSearchChange}
            placeholder={placeholder}
            className="h-12 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-400 focus:border-green-400 px-4 text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition min-w-0 flex-shrink-0"
            style={{ flexBasis: '70%', width: '70%' }}
          />
          <button type="submit" className="btn btn-primary text-white h-12 px-6 rounded-lg shadow flex-shrink-0">{buttonText}</button>
          <div className="min-w-[180px] w-[230px] flex-shrink-0">
            <select
              value={filterValue.value}
              onChange={e => {
                const selected = filterOptions.find(opt => opt.value === e.target.value);
                if (selected) onFilterChange(selected);
              }}
              className="h-12 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-400 focus:border-green-400 px-4 text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-w-[180px] w-[230px] transition"
              style={{ marginRight: 0, paddingRight: 0 }}
            >
              {filterOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchFilterBar; 