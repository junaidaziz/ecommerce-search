import type { FC } from 'react';
import Link from 'next/link';
import HomeIcon from '../icons/HomeIcon';
import FashionIcon from '../icons/FashionIcon';

export interface CategoryGridItem {
  name: string;
  slug?: string;
}

interface CategoryGridProps {
  categories?: CategoryGridItem[];
}

// Emoji fallback for missing icons
const WatchIcon = () => <span className="text-6xl mb-3" role="img" aria-label="Watch">⌚️</span>;
const ChairIcon = () => <span className="text-6xl mb-3" role="img" aria-label="Chair">🪑</span>;
const CameraIcon = () => <span className="text-6xl mb-3" role="img" aria-label="Camera">📷</span>;
const HeadphonesIcon = () => <span className="text-6xl mb-3" role="img" aria-label="Headphones">🎧</span>;

const CATEGORY_UI = [
  {
    name: 'Watches',
    slug: 'Watches',
    icon: <WatchIcon />, // blue
    color: 'text-blue-500',
  },
  {
    name: 'Furniture',
    slug: 'Furniture',
    icon: <ChairIcon />, // green
    color: 'text-green-500',
  },
  {
    name: 'Home',
    slug: 'Home',
    icon: <HomeIcon size={56} className="mb-3 text-yellow-500" />, // yellow
    color: 'text-yellow-500',
  },
  {
    name: 'Fashion',
    slug: 'Fashion',
    icon: <FashionIcon size={56} className="mb-3 text-pink-500" />, // pink
    color: 'text-pink-500',
  },
  {
    name: 'Camera',
    slug: 'Camera',
    icon: <CameraIcon />, // indigo
    color: 'text-indigo-500',
  },
  {
    name: 'Headphones',
    slug: 'Headphones',
    icon: <HeadphonesIcon />, // red
    color: 'text-red-500',
  },
];

const getIcon = (name: string) => {
  const found = CATEGORY_UI.find((c) => c.name === name);
  return found ? found.icon : <span className="text-6xl mb-3">📦</span>;
};
const getColor = (name: string) => {
  const found = CATEGORY_UI.find((c) => c.name === name);
  return found ? found.color : 'text-gray-400';
};

const CategoryGrid: FC<CategoryGridProps> = ({ categories }) => {
  const cats = categories && categories.length > 0 ? categories : CATEGORY_UI;
  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {cats.map((cat) => (
          <Link
            key={cat.name}
            href={`/products?category=${encodeURIComponent(cat.slug ?? cat.name)}`}
            className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center aspect-square min-h-[160px] max-h-[220px] mx-auto w-full cursor-pointer"
          >
            <span className={getColor(cat.name)}>{getIcon(cat.name)}</span>
            <span className="font-semibold text-gray-700 dark:text-gray-100 text-lg mt-1">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid; 