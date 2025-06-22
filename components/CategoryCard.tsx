import React from 'react';
import Link from 'next/link';
import type { Category } from '../types';
import ElectronicsIcon from './icons/ElectronicsIcon';
import FashionIcon from './icons/FashionIcon';
import HomeIcon from './icons/HomeIcon';
import ToysIcon from './icons/ToysIcon';
import SportsIcon from './icons/SportsIcon';

interface CategoryCardProps {
  category: Category;
}

const iconMap: Record<string, JSX.Element> = {
  Electronics: <ElectronicsIcon className="w-8 h-8 mb-2" />,
  Fashion: <FashionIcon className="w-8 h-8 mb-2" />,
  Home: <HomeIcon className="w-8 h-8 mb-2" />,
  Toys: <ToysIcon className="w-8 h-8 mb-2" />,
  Sports: <SportsIcon className="w-8 h-8 mb-2" />,
};

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link
      href={`/categories/${encodeURIComponent(category.name)}`}
      className="group border border-base-300 rounded-xl p-4 flex flex-col items-center text-center transition-transform duration-200 hover:shadow-lg hover:-translate-y-1 hover:scale-105 hover:border-primary"
    >
      {iconMap[category.name] ?? <div className="w-8 h-8 mb-2" />}
      <span className="capitalize font-medium">{category.name}</span>
    </Link>
  );
};

export default CategoryCard;
