import React, { useContext } from 'react';
import Link from 'next/link';
import type { Product } from '@/types';
import { AppContext } from '@contexts/AppContext';
import CartIcon from '../icons/CartIcon';
import Button from '../UI/Button';
import ProductImage from './ProductImage';
import ProductBadges from './ProductBadges';
import ProductInfo from './ProductInfo';
import ProductPrice from './ProductPrice';
import WishlistButton from './WishlistButton';
import { parseProductImages } from '@utils/productImageUtils';

interface ProductCardProps {
  product: Product;
  className?: string;
  inWishlist?: boolean;
  addToWish?: (product: Product) => void;
  removeFromWish?: (productId: string | number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className = '', inWishlist = false, addToWish, removeFromWish }) => {
  const appContext = useContext(AppContext);
  const { addToCart } = appContext || {};

  const imagesArr = parseProductImages(
    product.images,
    product.id,
    product.productType || undefined
  ).slice(0, 1);

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
  const isOut = stockStatus === 'Out of Stock';

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
    if (isOut) return;
    addToCart && addToCart(product);
  };

  return (
    <div className={`relative group ${className}`} aria-label={product.title}>
      <Link
        href={`/product/${product.slug}`}
        className="flex flex-col h-full rounded-2xl overflow-hidden p-4 gap-4 bg-white dark:bg-gray-800/90 border border-gray-200/70 dark:border-gray-700/50 shadow-sm hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 dark:hover:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 dark:focus-visible:ring-offset-gray-900 hover:bg-gray-50/50 dark:hover:bg-gray-800"
      >
        <div className="relative">
          <ProductImage images={imagesArr} />
          <WishlistButton inWishlist={inWishlist} onToggle={handleWishlistToggle} />
          <div className="absolute top-2 left-2 right-2 flex justify-between pointer-events-none">
            <ProductBadges isNew={isNew} rating={rating} stockStatus={stockStatus} />
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-3 px-1 pb-1">
          <ProductInfo slug={product.slug} title={product.title} />
          <ProductPrice minPrice={product.minPrice} maxPrice={product.maxPrice} />
          <div className="mt-auto">
            <Button
              type="button"
              variant="primary"
              size="md"
              fullWidth
              rounded
              shadow
              disabled={isOut}
              onClick={handleAddToCart}
              className={`relative py-2.5 px-4 flex items-center justify-center gap-2 font-semibold tracking-wide animate-[cartEnter_.6s_ease] group/cart overflow-hidden focus-visible:ring-teal-500 ${isOut ? 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-not-allowed opacity-70' : 'disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-teal-600 via-teal-500 to-indigo-500 hover:from-teal-500 hover:to-indigo-500'}`}
            >
              {!isOut && (
                <span className="absolute inset-0 opacity-0 group-hover/cart:opacity-60 transition-opacity duration-300 pointer-events-none bg-[radial-gradient(circle_at_75%_25%,rgba(255,255,255,0.35),transparent_60%)]" />
              )}
              <CartIcon className={`w-4 h-4 flex-shrink-0 transition-transform duration-500 ${isOut ? 'opacity-60' : 'group-hover/cart:scale-110 group-active/cart:scale-90 cart-bounce'}`} />
              <span className="whitespace-nowrap relative z-10">{isOut ? 'Out of Stock' : 'Add to Cart'}</span>
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
