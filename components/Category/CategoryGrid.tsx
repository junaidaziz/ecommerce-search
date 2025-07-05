import type { FC } from 'react';
import HomeIcon from '../icons/HomeIcon';
import FashionIcon from '../icons/FashionIcon';

export interface CategoryGridItem {
  name: string;
  slug?: string;
}

interface CategoryGridProps {
  categories: CategoryGridItem[];
}

// Emoji fallback for missing icons
const WatchIcon = () => <span className="text-5xl mb-3" role="img" aria-label="Watch">⌚️</span>;
const ChairIcon = () => <span className="text-5xl mb-3" role="img" aria-label="Chair">🪑</span>;
const CameraIcon = () => <span className="text-5xl mb-3" role="img" aria-label="Camera">📷</span>;
const HeadphonesIcon = () => <span className="text-5xl mb-3" role="img" aria-label="Headphones">🎧</span>;

const CATEGORY_UI = [
  {
    name: 'Watches',
    icon: <WatchIcon />, // blue
    color: 'text-blue-500',
  },
  {
    name: 'Furniture',
    icon: <ChairIcon />, // green
    color: 'text-green-500',
  },
  {
    name: 'Home',
    icon: <HomeIcon size={48} className="mb-3 text-yellow-500" />, // yellow
    color: 'text-yellow-500',
  },
  {
    name: 'Fashion',
    icon: <FashionIcon size={48} className="mb-3 text-pink-500" />, // pink
    color: 'text-pink-500',
  },
  {
    name: 'Camera',
    icon: <CameraIcon />, // indigo
    color: 'text-indigo-500',
  },
  {
    name: 'Headphones',
    icon: <HeadphonesIcon />, // red
    color: 'text-red-500',
  },
];

const CategoryGrid: FC<CategoryGridProps> = () => (
  <section className="text-center mb-24">
    <h2 className="text-4xl font-bold text-gray-800 mb-2">Browse Categories</h2>
    <p className="text-lg text-gray-500">Find exactly what you need...</p>
    <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
      {CATEGORY_UI.map((cat) => (
        <div
          key={cat.name}
          className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center justify-center aspect-square"
        >
          <span className={cat.color}>{cat.icon}</span>
          <span className="font-semibold text-gray-700">{cat.name}</span>
        </div>
      ))}
    </div>
  </section>
);

export default CategoryGrid; 