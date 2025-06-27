import React, { useContext } from 'react';
import Link from 'next/link';
import ProductImageSlider from './ProductImageSlider';
import { AppContext } from '@contexts/AppContext';
import type { AppContextValue } from '../../types';
import type { Product } from '@/types/product';
import { formatCurrency } from '@utils/formatCurrency';

interface ProductCardProps {
  product: Product;
  highlightTitle?: string;
  highlightDescription?: string;
  /** Render a smaller card variant */
  compact?: boolean;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  highlightTitle,
  highlightDescription,
  compact = false,
  className = '',
}) => {
  const context = useContext(AppContext) as AppContextValue;
  const addToCart = context?.addToCart;
  const addToWish = context?.addToWishlist;
  const removeFromWish = context?.removeFromWishlist;
  const wishlist = context?.wishlist || [];
  const inWishlist = wishlist.some((w) => w.product.id === product.id);

  const inventory =
    product.totalInventory !== undefined
      ? product.totalInventory
      : product.quantity;
  const isOut = typeof inventory === 'number' && inventory <= 0;
  const finalPrice =
    product.discountType === 'percentage'
      ? product.minPrice -
        ((product.minPrice * (product.discountValue || 0)) / 100)
      : product.discountType === 'fixed'
        ? product.minPrice - (product.discountValue || 0)
        : product.minPrice;
  const onSale =
    (product.discountType !== null && product.discountType !== undefined) ||
    product.maxPrice > product.minPrice;
  const isNew = product.tags?.toLowerCase().includes('new');
  const rating = Math.round(product.averageRating || 0);

  return (
    <div
      className={`group relative flex flex-col h-full border border-base-300 rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow duration-200 w-4/5 mx-auto ${className}`}
    >
      <button
        type="button"
        className="absolute top-2 right-2 z-10 btn btn-ghost btn-xs"
        onClick={(e) => {
          e.preventDefault();
          inWishlist
            ? removeFromWish && removeFromWish(product.id)
            : addToWish && addToWish(product);
        }}
      >
        {inWishlist ? '❤' : '♡'}
      </button>
      <Link href={`/product/${product.slug}`} className="block overflow-hidden">
        <ProductImageSlider
          images={
            product.featuredImage
              ? [product.featuredImage]
              : product.images && product.images.length > 0
                ? [product.images[0]]
                : []
          }
          placeholderSeed={Number(product.id)}
          className="w-full bg-gray-200 flex items-center justify-center"
          imgClass="transition-transform duration-200 group-hover:scale-105"
          aspectRatioClass="aspect-square"
        />
      </Link>
      {(isNew || onSale || isOut) && (
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && <span className="badge badge-primary">New</span>}
          {onSale && (
            <span className="badge badge-secondary">
              {product.discountType === 'percentage'
                ? `${product.discountValue}% OFF`
                : product.discountType === 'fixed'
                ? `${formatCurrency(product.discountValue || 0, product.currency)} OFF`
                : 'Sale'}
            </span>
          )}
          {isOut && <span className="badge">Out of stock</span>}
        </div>
      )}
      <div className={`${compact ? 'p-1 gap-0.5' : 'p-2 gap-1'} flex flex-col`}>
        <Link
          href={`/product/${product.slug}`}
          className={`font-semibold line-clamp-2 hover:underline ${compact ? 'text-sm' : 'text-base'}`}
        >
          <span
            dangerouslySetInnerHTML={{
              __html: highlightTitle || product.title || 'Untitled Product',
            }}
          />
        </Link>
        <p
          className={`text-base-content line-clamp-2 ${compact ? 'text-xs' : 'text-sm'}`}
        >
          <span
            dangerouslySetInnerHTML={{
              __html:
                highlightDescription ||
                product.descriptionText ||
                product.bodyHtmlText ||
                'No description available.',
            }}
          />
        </p>
        <div
          className={`flex justify-between items-center mt-auto ${compact ? 'text-xs' : 'text-sm'}`}
        >
          <span className={`font-bold ${compact ? 'text-sm' : 'text-base'}`}>
            {formatCurrency(finalPrice ?? 0, product.currency)}
          </span>
          {onSale && (
            <span className="ml-1 line-through text-sm text-gray-500">
              {formatCurrency(product.minPrice ?? 0, product.currency)}
            </span>
          )}
          {product.reviewCount > 0 && (
            <span className="text-xs">
              {'★'.repeat(rating)}
              {'☆'.repeat(5 - rating)} ({product.averageRating.toFixed(1)})
            </span>
          )}
        </div>
        <button
          className={`btn btn-primary absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity ${compact ? 'btn-xs' : 'btn-sm'}`}
          onClick={() => addToCart && addToCart(product)}
          disabled={!addToCart}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
