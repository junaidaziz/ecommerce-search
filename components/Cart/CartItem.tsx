import React from 'react';
import type { Product, Variant } from '@/types';

interface CartItemProps {
  item: Product & { qty: number; variant?: Variant };
  onChangeQty: (id: string, delta: number, variantId?: number) => void;
  onRemove: (id: string, variantId?: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onChangeQty, onRemove }) => {
  const price = parseFloat(
    typeof item.minPrice === 'number'
      ? item.minPrice.toString()
      : item.minPrice || '0'
  );
  const subtotal = price * item.qty;

  return (
    <li className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white truncate">
            {item.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            £{price.toFixed(2)} each
          </p>
        </div>

        {/* Quantity Controls and Price */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onChangeQty(item.id as string, -1, item.variant?.id)}
              disabled={item.qty <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
              {item.qty}
            </span>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold transition-colors"
              onClick={() => onChangeQty(item.id as string, 1, item.variant?.id)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Subtotal */}
          <div className="min-w-[80px] text-right">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              £{subtotal.toFixed(2)}
            </p>
          </div>

          {/* Remove Button */}
          <button
            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            onClick={() => onRemove(item.id as string, item.variant?.id)}
            aria-label="Remove item"
            title="Remove item"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </li>
  );
};

export default CartItem;
