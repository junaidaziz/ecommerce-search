import React from 'react';
import InputField from '../UI/InputField';
import SearchIcon from '../icons/SearchIcon';
import FilterSection from './FilterSection';

interface SearchFilterProps {
  keyword: string;
  setKeyword: React.Dispatch<React.SetStateAction<string>>;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ keyword, setKeyword }) => {
  return (
    <FilterSection 
      label="Search Products" 
      icon={<SearchIcon className="w-4 h-4 text-primary" />}
      className="pb-3 border-b border-gray-200 dark:border-gray-700"
      noBorder
    >
      <InputField
        type="text"
        placeholder="Search by name or description..."
        name="keyword"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="w-full text-base px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary dark:focus:border-primary transition-all duration-300 shadow-sm focus:shadow-lg"
      />
    </FilterSection>
  );
};

export default SearchFilter;
