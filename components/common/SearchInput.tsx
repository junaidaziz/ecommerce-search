import React, { useState } from 'react';
import SearchIcon from '../icons/SearchIcon';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (term: string) => void;
  icon?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search...',
  onSearch,
  icon,
  className = '',
  inputClassName = '',
  buttonClassName = '',
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
        className={`w-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-700 px-4 py-2 pr-12 rounded-full focus:ring-2 focus:ring-primary hover:shadow-md transition-all duration-200 text-base ${inputClassName}`}
      />
      <button
        type="button"
        onClick={() => onSearch?.(val)}
        className={`absolute right-3 inset-y-0 flex items-center justify-center p-0 bg-transparent text-primary hover:text-primary-600 focus:outline-none ${buttonClassName}`}
        aria-label="Submit search"
      >
        {icon || <SearchIcon className="w-5 h-5" aria-hidden="true" />}
      </button>
    </div>
  );
};

export default SearchInput;
