import React from 'react';
import StarIcon from '../../icons/StarIcon';

interface ProductHeaderProps {
  product: {
    title: string;
    vendor?: { brandName?: string };
    sku?: string;
  };
  averageRating: number;
  reviewCount: number;
  className?: string;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  product,
  averageRating,
  reviewCount,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <h1 className="text-2xl md:text-3xl font-bold text-base-content mb-1">
        {product.title}
      </h1>
      <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/70">
        <span>Vendor: {product.vendor?.brandName ?? 'Unknown'}</span>
        <span>•</span>
        <span>SKU: {product.sku || 'N/A'}</span>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              className={`w-5 h-5 ${star <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
          ))}
        </div>
        <span className="text-sm text-base-content/60">
          {averageRating.toFixed(1)} ({reviewCount} reviews)
        </span>
      </div>
    </div>
  );
};

export default ProductHeader; 