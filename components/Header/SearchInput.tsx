import React from 'react';
import type { Category } from '@/types';
import { SearchBar } from '@lib/dynamicImports';

interface Props {
  categories: Category[];
  className?: string;
}

const HeaderSearchInput: React.FC<Props> = ({ categories, className }) => (
  <div className={className ? className : "flex-1 min-w-[240px] max-w-2xl"}>
    <SearchBar
      className="w-full"
      inputClassName="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full px-5 py-2 text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
      buttonClassName="text-primary hover:text-primary-600 transition-all duration-200"
    />
  </div>
);

export default HeaderSearchInput;
