import type { FC } from 'react';
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

const getIcon = (name: string) => {
  const found = CATEGORY_UI.find((c) => c.name === name);
  return found ? found.icon : <span className="text-5xl mb-3">📦</span>;
};
const getColor = (name: string) => {
  const found = CATEGORY_UI.find((c) => c.name === name);
  return found ? found.color : 'text-gray-400';
};

const CategoryGrid: FC<CategoryGridProps> = ({ categories }) => {
  const cats = categories && categories.length > 0 ? categories : CATEGORY_UI;
  return (
    <section className="max-w-5xl mx-auto text-center mb-24 px-2 sm:px-4">
      <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-3 mt-12 tracking-tight">Browse Categories</h2>
      <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-300 mb-10">Find exactly what you need…</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 sm:gap-6">
        {cats.map((cat) => (
          <div
            key={cat.name}
            className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center aspect-square min-h-[140px] max-h-[200px] mx-auto w-full"
          >
            <span className={getColor(cat.name)}>{getIcon(cat.name)}</span>
            <span className="font-semibold text-gray-700 dark:text-gray-100 text-lg mt-1">{cat.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid; 