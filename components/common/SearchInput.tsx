import React, { useState } from 'react';
import SearchIcon from '../icons/SearchIcon';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (term: string) => void;
  icon?: React.ReactNode;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search...',
  onSearch,
  icon,
  className = '',
  value,
  onChange,
  ...rest
}) => {
  const [internal, setInternal] = useState('');
  const val = typeof value === 'string' ? value : internal;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternal(e.target.value);
    onChange?.(e);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch?.(val);
    }
    rest.onKeyDown?.(e);
  };
  return (
    <div className={`relative flex items-center ${className}`}>
      <input
        {...rest}
        type="text"
        aria-label="Search"
        value={val}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full sm:w-72 md:w-96 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-transparent px-4 py-2 pr-10 rounded-lg focus:ring-2 focus:ring-primary hover:shadow-sm transition-all duration-200"
      />
      <button
        type="button"
        onClick={() => onSearch?.(val)}
        className="absolute right-3 inset-y-0 flex items-center text-gray-500 hover:text-gray-400"
        aria-label="Submit search"
      >
        {icon || <SearchIcon className="w-5 h-5" aria-hidden="true" />}
      </button>
    </div>
  );
};

export default SearchInput;
