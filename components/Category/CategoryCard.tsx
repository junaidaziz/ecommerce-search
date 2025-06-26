import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '../../types';
import CATEGORY_IMAGES from '../../lib/categoryImages';

interface CategoryCardProps {
  category: Category;
}

const placeholder = '/placeholder.png';

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link
      href={`/categories/${encodeURIComponent(category.name)}`}
      className="group block border border-base-300 rounded-xl overflow-hidden shadow-sm transition-transform duration-200 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="relative w-full aspect-square bg-base-200">
        <Image
          src={CATEGORY_IMAGES[category.name] || placeholder}
          alt={category.name}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="p-3 h-14 flex items-center justify-center">
        <span className="font-medium text-center line-clamp-2">
          {category.name}
        </span>
      </div>
    </Link>
  );
};

export default CategoryCard;
