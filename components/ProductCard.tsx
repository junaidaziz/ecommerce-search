import React, { useContext } from 'react';
import Link from 'next/link';
import ProductImageSlider from './ProductImageSlider';
import { AppContext, AppContextValue } from '../contexts/AppContext';
import type { Product } from '../types/product';
import { formatCurrency } from '../lib/utils/formatCurrency';

interface ProductCardProps {
  product: Product;
  highlightTitle?: string;
  highlightDescription?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  highlightTitle,
  highlightDescription,
}) => {
  const context = useContext(AppContext) as AppContextValue;
  const addToCart = context?.addToCart;

  const inventory =
    product.totalInventory !== undefined
      ? product.totalInventory
      : (product as any).quantity;
  const isOut = typeof inventory === 'number' && inventory <= 0;
  const onSale = product.maxPrice > product.minPrice;
  const isNew = product.tags?.toLowerCase().includes('new');
  const rating = Math.round(product.averageRating || 0);

  return (
    <div className="group relative flex flex-col h-full bg-base-100 border border-base-300 rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow duration-200">
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
          className="w-full bg-gray-200 flex items-center justify-center aspect-[4/5]"
          imgClass="transition-transform duration-200 group-hover:scale-105"
        />
      </Link>
      {(isNew || onSale || isOut) && (
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && <span className="badge badge-primary">New</span>}
          {onSale && <span className="badge badge-secondary">Sale</span>}
          {isOut && <span className="badge">Out of stock</span>}
        </div>
      )}
      <div className="p-3 flex flex-col gap-1">
        <Link
          href={`/product/${product.slug}`}
          className="font-semibold text-base line-clamp-2 hover:underline"
        >
          <span
            dangerouslySetInnerHTML={{
              __html: highlightTitle || product.title || 'Untitled Product',
            }}
          />
        </Link>
        <p className="text-sm text-base-content line-clamp-2">
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
        <div className="flex justify-between items-center mt-auto text-sm">
          <span className="font-bold text-base">
            {formatCurrency(product.minPrice ?? 0, product.currency)}
          </span>
          {product.reviewCount > 0 && (
            <span className="text-xs">
              {'★'.repeat(rating)}
              {'☆'.repeat(5 - rating)}
            </span>
          )}
        </div>
        <button
          className="btn btn-sm btn-primary absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
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
