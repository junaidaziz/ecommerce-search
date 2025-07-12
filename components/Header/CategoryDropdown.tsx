import React from 'react';
import type { Category } from '@/types';
import { CategoryMenu } from '@lib/dynamicImports';

interface Props {
  categories: Category[];
}

const CategoryDropdown: React.FC<Props> = ({ categories }) => (
  <div className="hidden md:block ml-4">
    <CategoryMenu categories={categories} />
  </div>
);

export default CategoryDropdown;
