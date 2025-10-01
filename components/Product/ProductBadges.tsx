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
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
            New
          </span>
        )}
        {rating > 0 && (
          <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold border border-yellow-200">
            <StarIcon className="w-3 h-3 fill-current" />
            <span>{rating}</span>
          </div>
        )}
      </div>
      <div
        className={`text-xs font-medium px-2 py-0.5 rounded-full border shadow-sm ${
          stockStatus === 'In Stock'
            ? 'bg-green-100 text-green-700 border-green-200'
            : stockStatus === 'Low Stock'
              ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
              : 'bg-rose-100 text-rose-700 border-rose-200'
        }`}
      >
        {stockStatus}
      </div>
    </div>
  );
};

export default ProductBadges;
