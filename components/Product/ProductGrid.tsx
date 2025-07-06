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
      className={`min-h-[400px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${className}`}
    >
      {products.length === 0 ? (
        Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <ProductCardSkeleton />
          </div>
        ))
      ) : (
        products.map((p) => (
          <div key={p.id} className="group">
            <ProductCard
              product={p}
              className="w-full h-full transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
              inWishlist={wishlist.some((w) => w.product.id === p.id)}
              addToWish={addToWish}
              removeFromWish={removeFromWish ? (id) => removeFromWish(Number(id)) : undefined}
            />
          </div>
        ))
      )}
    </div>
  );
};

export default ProductGrid;
