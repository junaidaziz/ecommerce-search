import React from 'react';
import CheckCircleIcon from '../../icons/CheckCircleIcon';
import WarningIcon from '../../icons/WarningIcon';

interface ProductPriceStockProps {
  product: {
    currency: string;
    minPrice: number | string;
    totalInventory?: number;
  };
  className?: string;
}

const ProductPriceStock: React.FC<ProductPriceStockProps> = ({
  product,
  className = '',
}) => {
  const price = parseFloat(
    typeof product.minPrice === 'number'
      ? product.minPrice.toString()
      : product.minPrice || '0'
  ).toFixed(2);

  const stockStatus = product.totalInventory && product.totalInventory > 10
    ? 'In Stock'
    : product.totalInventory && product.totalInventory > 0
      ? 'Low Stock'
      : 'Out of Stock';

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <span className="text-3xl font-bold text-primary">
        {product.currency} {price}
      </span>
      <div className="flex items-center gap-2">
        {stockStatus === 'In Stock' ? (
          <CheckCircleIcon className="w-5 h-5 text-green-500" />
        ) : stockStatus === 'Low Stock' ? (
          <WarningIcon className="w-5 h-5 text-yellow-500" />
        ) : (
          <WarningIcon className="w-5 h-5 text-red-500" />
        )}
        <span className={`font-medium ${
          stockStatus === 'In Stock' ? 'text-green-600' :
          stockStatus === 'Low Stock' ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {stockStatus}
        </span>
        {product.totalInventory && (
          <span className="text-xs text-base-content/60">
            ({product.totalInventory} available)
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductPriceStock; 