import React, { useContext } from 'react';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import type { Product } from '@/types';
import { AppContext } from '@contexts/AppContext';

interface ProductGridProps {
  products: Product[];
  className?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  className = '',
}) => {
  const appContext = useContext(AppContext);
  const wishlist = appContext?.wishlist || [];
  const addToWish = appContext?.addToWishlist;
  const removeFromWish = appContext?.removeFromWishlist;

  return (
    <div
      className={`min-h-[400px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 lg:gap-6 py-4 ${className}`}
    >
      {products.length === 0
        ? Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <ProductCardSkeleton />
            </div>
          ))
        : products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              className="w-full"
              inWishlist={wishlist.some((w) => w.product.id === p.id)}
              addToWish={addToWish}
              removeFromWish={
                removeFromWish ? (id) => removeFromWish(Number(id)) : undefined
              }
            />
          ))}
    </div>
  );
};

export default ProductGrid;
