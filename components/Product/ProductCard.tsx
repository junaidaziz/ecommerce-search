import React, { useContext } from 'react';
import Link from 'next/link';
import type { Product } from '@/types';
import { formatCurrency } from '@utils/formatCurrency';
import ProductImageSlider from './ProductImageSlider';
import { AppContext } from '@contexts/AppContext';
import CartIcon from '../icons/CartIcon';
import StarIcon from '../icons/StarIcon';
import HeartIcon from '../icons/HeartIcon';
import Button from '../UI/Button';

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
      .map((img: string | { url?: string; alt?: string }) => {
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
          return {
            url: img.url.trim(),
            alt: typeof img.alt === 'string' ? img.alt : undefined,
          };
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
  const stockStatus =
    product.totalInventory && product.totalInventory > 10
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
      className={`group relative flex flex-col h-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:border-primary dark:hover:border-primary transition-all duration-300 p-4 gap-4 ${className}`}
    >
      {/* Wishlist Button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute top-5 right-5 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-base-200 border border-base-300 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-110 hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary p-0"
        onClick={handleWishlistToggle}
        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <HeartIcon className={`w-10 h-10 transition-colors ${inWishlist ? 'text-primary fill-primary' : 'text-base-content/60 fill-base-content/60'}`} />
      </Button>

      {/* Product Image */}
      <div className="relative overflow-hidden rounded-lg mb-3 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <ProductImageSlider
          images={imagesArr}
          className="w-full aspect-[4/3] group-hover:scale-105 transition-transform duration-300"
          imgClass="object-contain"
          aspectRatioClass="aspect-[4/3]"
          showControls={false}
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col gap-3 px-1 pb-1">
        {/* Badges */}
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

        {/* Product Title */}
        <Link
          href={`/product/${product.slug}`}
          className="transition-colors duration-200"
        >
          <h3
            className="font-semibold text-base md:text-lg text-gray-900 dark:text-white line-clamp-2 leading-snug"
            title={product.title}
          >
            {product.title}
          </h3>
        </Link>

        {/* Price and Actions */}
        <div className="mt-auto space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(product.minPrice)}
            </span>
            {product.maxPrice && product.maxPrice > product.minPrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatCurrency(product.maxPrice)}
              </span>
            )}
          </div>
          {/* Quick Add to Cart */}
          <Button
            type="button"
            variant="success"
            size="md"
            fullWidth
            rounded
            className="py-2 px-4 flex items-center justify-center gap-2"
            onClick={handleAddToCart}
          >
            <CartIcon className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Add to Cart</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
