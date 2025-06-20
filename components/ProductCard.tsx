import React, { useContext } from 'react';
import Link from 'next/link';
import ProductImageSlider from './ProductImageSlider';
import { AppContext, AppContextValue } from '../contexts/AppContext';
import type { Product } from '../types/product';

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

  const isOut = product.TOTAL_INVENTORY !== undefined && product.TOTAL_INVENTORY <= 0;
  const onSale = product.MAX_PRICE > product.MIN_PRICE;
  const isNew = product.TAGS?.toLowerCase().includes('new');
  const rating = Math.round(product.AVERAGE_RATING || 0);

  return (
    <div className="group relative flex flex-col h-full bg-base-100 border border-base-300 rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow duration-200">
      <Link href={`/product/${product.SLUG}`} className="block overflow-hidden">
        <ProductImageSlider
          images={
            product.IMAGES && product.IMAGES.length > 0
              ? product.IMAGES
              : product.FEATURED_IMAGE?.url
              ? [product.FEATURED_IMAGE.url]
              : []
          }
          placeholderSeed={Number(product.ID)}
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
        <Link href={`/product/${product.SLUG}`} className="font-semibold text-base line-clamp-2 hover:underline">
          <span
            dangerouslySetInnerHTML={{
              __html: highlightTitle || product.TITLE || 'Untitled Product',
            }}
          />
        </Link>
        <p className="text-sm text-base-content line-clamp-2">
          <span
            dangerouslySetInnerHTML={{
              __html:
                highlightDescription ||
                product.DESCRIPTION_TEXT ||
                product.BODY_HTML_TEXT ||
                'No description available.',
            }}
          />
        </p>
        <div className="flex justify-between items-center mt-auto text-sm">
          <span className="font-bold">
            {product.CURRENCY} {product.MIN_PRICE.toFixed(2)}
          </span>
          {product.REVIEW_COUNT > 0 && (
            <span className="text-xs">
              {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
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
