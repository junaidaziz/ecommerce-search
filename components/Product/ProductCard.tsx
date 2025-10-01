import React, { useContext } from 'react';
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

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className = '',
  inWishlist = false,
  addToWish,
  removeFromWish,
}) => {
  const appContext = useContext(AppContext);
  const { addToCart } = appContext || {};

  // Use utility function to parse and get images with placeholders
  const imagesArr = parseProductImages(
    product.images, 
    product.id,
    product.productType || undefined
  );

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
      <WishlistButton inWishlist={inWishlist} onToggle={handleWishlistToggle} />

      {/* Product Image */}
      <ProductImage images={imagesArr} />

      {/* Product Info */}
      <div className="flex-1 flex flex-col gap-3 px-1 pb-1">
        {/* Badges */}
        <ProductBadges isNew={isNew} rating={rating} stockStatus={stockStatus} />

        {/* Product Title */}
        <ProductInfo slug={product.slug} title={product.title} />

        {/* Price and Actions */}
        <div className="mt-auto space-y-2">
          <ProductPrice minPrice={product.minPrice} maxPrice={product.maxPrice} />
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
