import React from 'react';
import CartIcon from '../../icons/CartIcon';
import type { Product } from '@/types';

interface ProductVariant {
  id: string | number;
  attributes: Record<string, string>;
  quantity: number;
}

interface ProductCartActionsProps {
  product: Product;
  selectedVariant?: ProductVariant;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: (product: Product, variant?: ProductVariant) => void;
  onRemoveFromCart: (productId: string, variantId?: string) => void;
  onChangeQty: (productId: string, change: number, variantId?: string) => void;
  isInCart: boolean;
  cartItemQuantity: number;
  stockStatus: string;
  className?: string;
}

const ProductCartActions: React.FC<ProductCartActionsProps> = ({
  product,
  selectedVariant,
  quantity,
  onQuantityChange,
  onAddToCart,
  onRemoveFromCart,
  onChangeQty,
  isInCart,
  cartItemQuantity,
  stockStatus,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {isInCart ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-base-content">
              Quantity in Cart
            </span>
            <span className="text-lg font-bold text-primary">
              {cartItemQuantity}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-outline flex-1 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onChangeQty(String(product.id), -1, selectedVariant?.id ? String(selectedVariant.id) : undefined)}
              disabled={cartItemQuantity <= 1}
            >
              -
            </button>
            <button
              className="btn btn-outline flex-1 hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-all duration-200"
              onClick={() => onChangeQty(String(product.id), 1, selectedVariant?.id ? String(selectedVariant.id) : undefined)}
            >
              +
            </button>
            <button
              className="btn btn-error text-white hover:bg-red-700 hover:scale-105 transition-all duration-200"
              onClick={() => onRemoveFromCart(String(product.id), selectedVariant?.id ? String(selectedVariant.id) : undefined)}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-base-content">
              Quantity
            </label>
            <div className="flex items-center border border-base-300 rounded-lg overflow-hidden">
              <button
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-red-50 hover:text-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-r border-base-300"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-4 py-2 min-w-[3rem] text-center bg-base-100">
                {quantity}
              </span>
              <button
                onClick={() => onQuantityChange(quantity + 1)}
                className="px-3 py-2 hover:bg-green-50 hover:text-green-600 transition-all duration-200 border-l border-base-300"
              >
                +
              </button>
            </div>
          </div>
          <button
            className="relative group/cart btn btn-lg w-full overflow-hidden bg-gradient-to-r from-teal-600 via-teal-500 to-indigo-500 text-white font-semibold tracking-wide shadow-md hover:shadow-lg hover:brightness-110 transition-all duration-300 hover:scale-[1.02] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => onAddToCart(product, selectedVariant)}
            disabled={(product.variants && product.variants.length > 0 && !selectedVariant) || stockStatus === 'Out of Stock'}
          >
            <span className="absolute inset-0 opacity-25 group-hover/cart:opacity-45 transition-opacity bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.4),transparent_60%)]" />
            <CartIcon className="w-5 h-5 mr-2 relative z-10 transition-transform duration-500 group-hover/cart:scale-110 group-active/cart:scale-90 cart-bounce" />
            <span className="relative z-10">Add to Cart</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCartActions; 