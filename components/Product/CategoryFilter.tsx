import React from 'react';
import type { Category } from '@/types';
import { Checkbox } from '../form-fields';
import TagIcon from '../icons/TagIcon';
import FilterSection from './FilterSection';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  categories, 
  selectedCategories, 
  setSelectedCategories 
}) => {
  return (
    <FilterSection 
      label="Categories" 
      icon={<TagIcon className="w-4 h-4 text-blue-500 dark:text-blue-400" />}
    >
      <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-4 max-h-64 overflow-y-auto border border-gray-200/50 dark:border-gray-700/50">
        <div className="space-y-2">
          {categories.map((c) => (
            <Checkbox
              key={c.slug}
              label={c.name}
              name={`cat-${c.slug}`}
              checked={selectedCategories.includes(c.slug || '')}
              onChange={(e) => {
                const slug = c.slug || '';
                setSelectedCategories((prev) =>
                  e.target.checked
                    ? [...prev, slug]
                    : prev.filter((s) => s !== slug)
                );
              }}
              className="text-base font-medium text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary transition-colors duration-200 hover:bg-primary/5 dark:hover:bg-primary/10 rounded px-2 py-1"
            />
          ))}
        </div>
      </div>
    </FilterSection>
  );
};

export default CategoryFilter;
