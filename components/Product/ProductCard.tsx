import React, { useContext } from 'react';
import Link from 'next/link';
import type { Product } from '@/types';
import { formatCurrency } from '@utils/formatCurrency';
import ProductImageSlider from './ProductImageSlider';
import { AppContext } from '@contexts/AppContext';

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
  const appContext = useContext(AppContext);
  const { addToCart } = appContext || {};

  // Robust image handling for ProductImageSlider
  let imagesArr: { url: string; alt?: string }[] = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    imagesArr = product.images
      .map((img: any) => {
        if (typeof img === 'string' && /^(\/|https?:\/\/)/.test(img.trim())) {
          // Valid string URL (relative or absolute)
          return { url: img.trim() };
        } else if (
          img &&
          typeof img === 'object' &&
          typeof img.url === 'string' &&
          /^(\/|https?:\/\/)/.test(img.url.trim())
        ) {
          // Valid object with url
          return { url: img.url.trim(), alt: typeof img.alt === 'string' ? img.alt : undefined };
        }
        // Ignore objects with only id or invalid url
        return null;
      })
      .filter(Boolean) as { url: string; alt?: string }[];
  }
  // If no valid images, use placeholder
  if (imagesArr.length === 0) {
    imagesArr = [{ url: '/placeholder.png', alt: 'No image available' }];
  }

  const tagsString = Array.isArray(product.tags)
    ? product.tags.join(',')
    : typeof product.tags === 'string'
      ? product.tags
      : '';
  const isNew = tagsString.toLowerCase().includes('new');
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (addToCart) {
      addToCart(product);
    }
  };

  return (
    <div
      className={`group relative flex flex-col h-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden shadow hover:shadow-2xl transition-all duration-300 p-5 gap-4 ${className}`}
    >
      {/* Wishlist Button */}
      <button
        type="button"
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-110 hover:bg-rose-100/70 focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={handleWishlistToggle}
        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg className={`w-5 h-5 transition-colors ${inWishlist ? 'text-red-500 fill-red-500' : 'text-gray-400 fill-gray-400'}`} viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
        </svg>
      </button>

      {/* Product Image */}
      <div className="relative overflow-hidden rounded-xl mb-4 bg-gray-100 dark:bg-gray-700 flex items-center justify-center min-h-[180px]">
        <ProductImageSlider
          images={imagesArr}
          className="aspect-square w-full group-hover:scale-105 transition-transform duration-300"
          showControls={false}
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col gap-3 px-1 pb-1">
        {/* Badges */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {isNew && (
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">New</span>
            )}
            {rating > 0 && (
              <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold border border-yellow-200">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{rating}</span>
              </div>
            )}
          </div>
          <div className={`text-xs font-medium px-2 py-0.5 rounded-full border shadow-sm
            ${stockStatus === 'In Stock' ? 'bg-green-100 text-green-700 border-green-200' :
              stockStatus === 'Low Stock' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
              'bg-rose-100 text-rose-700 border-rose-200'}
          `}>
            {stockStatus}
          </div>
        </div>

        {/* Product Title */}
        <Link href={`/product/${product.slug}`} className="transition-colors duration-200">
          <h3 className="font-bold text-lg md:text-xl text-gray-900 dark:text-white truncate mb-1 leading-snug" title={product.title}>
            {product.title}
          </h3>
        </Link>

        {/* Price and Actions */}
        <div className="mt-auto space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(product.minPrice)}
            </span>
            {product.maxPrice && product.maxPrice > product.minPrice && (
              <span className="text-base text-gray-400 line-through">
                {formatCurrency(product.maxPrice)}
              </span>
            )}
          </div>
          {/* Quick Add to Cart */}
          <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 hover:scale-[1.03] flex items-center justify-center shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400" onClick={handleAddToCart}>
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            <span className="whitespace-nowrap">Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
