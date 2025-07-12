import React from 'react';
import type { Category } from '@/types';
import { SearchBar } from '@lib/dynamicImports';

interface Props {
  categories: Category[];
}

const HeaderSearchInput: React.FC<Props> = ({ categories }) => (
  <div className="flex-1 min-w-[180px] max-w-xl">
    <SearchBar categories={categories} className="w-full md:w-80" />
  </div>
);

export default HeaderSearchInput;
