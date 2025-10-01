import React from 'react';
import { formatCurrency } from '@utils/formatCurrency';

interface ProductPriceProps {
  minPrice: number;
  maxPrice?: number;
}

const ProductPrice: React.FC<ProductPriceProps> = ({ minPrice, maxPrice }) => {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-lg font-semibold text-gray-900 dark:text-white">
        {formatCurrency(minPrice)}
      </span>
      {maxPrice && maxPrice > minPrice && (
        <span className="text-sm text-gray-400 line-through">
          {formatCurrency(maxPrice)}
        </span>
      )}
    </div>
  );
};

export default ProductPrice;
