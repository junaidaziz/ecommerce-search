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
      icon={<SearchIcon className="w-4 h-4 text-primary dark:text-primary-light" />}
      className="pb-4 border-b border-gray-200/70 dark:border-gray-700/50"
      noBorder
    >
      <InputField
        type="text"
        placeholder="Search by name or description..."
        name="keyword"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="w-full text-sm px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:border-primary transition-all duration-200"
      />
    </FilterSection>
  );
};

export default SearchFilter;
