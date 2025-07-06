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
  const stockStatus = product.totalInventory && product.totalInventory > 10
    ? 'In Stock'
    : product.totalInventory && product.totalInventory > 0
      ? 'Low Stock'
      : 'Out of Stock';

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
      className={`group relative flex flex-col h-full bg-base-100 border border-base-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${className}`}
    >
      {/* Wishlist Button */}
      <button
        type="button"
        className="absolute top-3 right-3 z-20 p-2 rounded-full bg-base-100/90 backdrop-blur-sm hover:bg-base-100 shadow-lg transition-all duration-200 hover:scale-110"
        onClick={handleWishlistToggle}
        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg className={`w-4 h-4 ${inWishlist ? 'text-red-500 fill-current' : 'text-base-content/60'}`} viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>

      {/* Product Image */}
      <div className="relative overflow-hidden">
        <ProductImageSlider
          images={product.images || []}
          className="aspect-square w-full"
          showControls={false}
        />
        <Link 
          href={`/product/${product.slug}`} 
          className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary/10 flex items-center justify-center"
          aria-label={`View ${product.title} details`}
        >
          <div className="bg-base-100 rounded-full p-3 shadow-lg">
            <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Product Info */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Badges */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isNew && (
              <span className="badge badge-primary badge-sm font-medium">New</span>
            )}
            {rating > 0 && (
              <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{rating}</span>
              </div>
            )}
          </div>
          <div className={`text-xs font-medium px-2 py-1 rounded-full ${
            stockStatus === 'In Stock' ? 'bg-green-100 text-green-800' :
            stockStatus === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {stockStatus}
          </div>
        </div>

        {/* Product Title */}
        <Link href={`/product/${product.slug}`} className="group-hover:text-primary transition-colors duration-200">
          <h3 className="font-semibold text-base-content line-clamp-2 mb-3 leading-tight">
            {product.title}
          </h3>
        </Link>

        {/* Price and Actions */}
        <div className="mt-auto space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-primary">
              {formatCurrency(product.minPrice)}
            </span>
            {product.maxPrice && product.maxPrice > product.minPrice && (
              <span className="text-sm text-base-content/60 line-through">
                {formatCurrency(product.maxPrice)}
              </span>
            )}
          </div>
          
          {/* Quick Add to Cart */}
          <button className="w-full btn btn-primary btn-sm transition-all duration-200 hover:scale-105 flex items-center justify-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
