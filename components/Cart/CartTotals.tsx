import React from 'react';

interface CartTotalsProps {
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
}

const CartTotals: React.FC<CartTotalsProps> = ({
  itemCount,
  subtotal,
  shipping,
  total,
}) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-3">
      {/* Item Count */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">Total Items:</span>
        <span className="font-medium text-gray-900 dark:text-white">
          {itemCount}
        </span>
      </div>

      {/* Subtotal */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
        <span className="font-medium text-gray-900 dark:text-white">
          £{subtotal.toFixed(2)}
        </span>
      </div>

      {/* Shipping */}
      <div className="flex justify-between items-center text-sm pb-3 border-b border-gray-200 dark:border-gray-700">
        <span className="text-gray-600 dark:text-gray-400">
          Estimated Shipping:
        </span>
        <span className="font-medium text-gray-900 dark:text-white">
          £{shipping.toFixed(2)}
        </span>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center pt-2">
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          Total:
        </span>
        <span className="text-2xl font-bold text-primary dark:text-primary-light">
          £{total.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default CartTotals;
