import React from 'react';
import Link from 'next/link';
import type { Product } from '@/types';
import { formatCurrency } from '@utils/formatCurrency';
import ProductImageSlider from './ProductImageSlider';

interface ProductCardProps {
  product: Product;
  className?: string;
  inWishlist?: boolean;
  addToWish?: (product: Product) => void;
  removeFromWish?: (productId: string | number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className = '',
  inWishlist = false,
  addToWish,
  removeFromWish,
}) => {
  const isNew = product.tags?.toLowerCase().includes('new');
  const rating = Math.round(product.averageRating || 0);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWish && removeFromWish(product.id);
    } else {
      addToWish && addToWish(product);
    }
  };

  return (
    <div
      className={`group relative flex flex-col h-full border border-base-300 rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow duration-200 w-4/5 mx-auto ${className}`}
    >
      <button
        type="button"
        className="absolute top-2 right-2 z-20 btn btn-ghost btn-xs bg-base-100/80 hover:bg-base-100"
        onClick={handleWishlistToggle}
      >
        {inWishlist ? '❤' : '♡'}
      </button>
      <div className="relative">
        <ProductImageSlider
          images={product.images || []}
          className="aspect-square w-full"
          showControls={false}
        />
        <Link 
          href={`/product/${product.slug}`} 
          className="absolute inset-0 z-10 opacity-0 hover:opacity-100 transition-opacity duration-200 bg-base-200/20"
          aria-label={`View ${product.title} details`}
        />
      </div>
      <div className="flex-1 p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          {isNew && (
            <span className="badge badge-primary badge-sm">New</span>
          )}
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              <span className="text-sm text-gray-600">{rating}</span>
            </div>
          )}
        </div>
        <Link href={`/product/${product.slug}`} className="hover:underline">
          <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
            {product.title}
          </h3>
        </Link>
        <div className="mt-auto">
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(product.minPrice)}
            {product.maxPrice && product.maxPrice > product.minPrice && (
              <span className="text-gray-500">
                {' '}
                - {formatCurrency(product.maxPrice)}
              </span>
            )}
          </p>
          {product.totalInventory !== undefined && (
            <p className="text-xs text-gray-500 mt-1">
              {product.totalInventory > 0
                ? `${product.totalInventory} in stock`
                : 'Out of stock'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
