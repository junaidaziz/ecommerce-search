import React from 'react';
import StarIcon from '../icons/StarIcon';

interface ProductBadgesProps {
  isNew?: boolean;
  rating?: number;
  stockStatus: string;
}

const ProductBadges: React.FC<ProductBadgesProps> = ({ isNew, rating = 0, stockStatus }) => {
  return (
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2">
        {isNew && (
          <span className="bg-blue-500/10 dark:bg-blue-400/20 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full border border-blue-500/20 dark:border-blue-400/30 shadow-sm">
            New
          </span>
        )}
        {rating > 0 && (
          <div className="flex items-center gap-1 bg-amber-500/10 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full text-xs font-semibold border border-amber-500/20 dark:border-amber-400/30 shadow-sm">
            <StarIcon className="w-3 h-3 fill-current" />
            <span>{rating}</span>
          </div>
        )}
      </div>
      <div
        className={`text-xs font-semibold px-2.5 py-1 rounded-full border shadow-sm ${
          stockStatus === 'In Stock'
            ? 'bg-emerald-500/10 dark:bg-emerald-400/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 dark:border-emerald-400/30'
            : stockStatus === 'Low Stock'
              ? 'bg-amber-500/10 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 border-amber-500/20 dark:border-amber-400/30'
              : 'bg-rose-500/10 dark:bg-rose-400/20 text-rose-700 dark:text-rose-300 border-rose-500/20 dark:border-rose-400/30'
        }`}
      >
        {stockStatus}
      </div>
    </div>
  );
};

export default ProductBadges;
