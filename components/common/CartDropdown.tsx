import Link from 'next/link';
import TrashIcon from '../icons/TrashIcon';
import CartIcon from '../icons/CartIcon';
import type { CartItem } from '../../types/cart';
import React, { useRef, useState } from 'react';

interface CartDropdownProps {
  cart: CartItem[];
  changeQty: (id: string, delta: number, variantId?: number) => void;
  removeFromCart: (id: string, variantId?: number) => void;
  itemCount: number;
}

const CartDropdown: React.FC<CartDropdownProps> = ({ cart, changeQty, removeFromCart, itemCount }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
    } else {
      document.removeEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        aria-label="Shopping cart"
        className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:scale-105 cursor-pointer bg-transparent focus:bg-transparent active:bg-transparent"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        tabIndex={0}
      >
        <CartIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>
      {open && (
        <div
          className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl z-50"
          style={{ minWidth: '20rem', top: '100%' }}
        >
          <div className="card-body p-0">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <CartIcon className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-center mb-4">Your cart is empty</p>
                <Link href="/products" className="btn btn-primary btn-sm px-6">Start Shopping</Link>
              </div>
            ) : (
              <div className="flex flex-col max-h-96">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Shopping Cart</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
                </div>
                <ul className="flex-1 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                  {cart.map((item) => {
                    const price = parseFloat(
                      typeof item.minPrice === 'number'
                        ? item.minPrice.toString()
                        : item.minPrice || '0'
                    );
                    return (
                      <li
                        key={item.id}
                        className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <img
                          src={item.images || '/placeholder.png'}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                        />
                        <div className="flex flex-col flex-1 min-w-0">
                          <p
                            className="font-medium text-gray-900 dark:text-gray-100 text-sm line-clamp-2 break-words"
                            title={item.title}
                          >
                            {item.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            £{price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                            <button
                              type="button"
                              className="w-6 h-6 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                              aria-label="Decrease quantity"
                              onClick={() => changeQty(String(item.id), -1, item.variant?.id)}
                            >
                              -
                            </button>
                            <span className="px-2 text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[20px] text-center">{item.qty}</span>
                            <button
                              type="button"
                              className="w-6 h-6 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                              aria-label="Increase quantity"
                              onClick={() => changeQty(String(item.id), 1, item.variant?.id)}
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            className="w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            aria-label="Remove from cart"
                            onClick={() => removeFromCart(String(item.id), item.variant?.id)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      £{cart
                        .reduce(
                          (s, i) =>
                            s +
                            i.qty *
                              parseFloat(
                                typeof i.minPrice === 'number'
                                  ? i.minPrice.toString()
                                  : i.minPrice || '0'
                              ),
                          0
                        )
                        .toFixed(2)}
                    </span>
                  </div>
                  <Link
                    href="/cart"
                    className="btn btn-primary w-full"
                  >
                    View Cart
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartDropdown; 