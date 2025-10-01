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
      icon={<TagIcon className="w-4 h-4 text-blue-500" />}
    >
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 max-h-64 overflow-y-auto">
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
              className="text-base font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-primary transition-colors duration-200 hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary dark:hover:border-primary rounded"
            />
          ))}
        </div>
      </div>
    </FilterSection>
  );
};

export default CategoryFilter;
