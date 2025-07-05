import Link from 'next/link';
import TrashIcon from '../icons/TrashIcon';
import CartIcon from '../icons/CartIcon';
import type { CartItem } from '../../types/cart';
import React from 'react';

interface CartDropdownProps {
  cart: CartItem[];
  changeQty: (id: string, delta: number, variantId?: number) => void;
  removeFromCart: (id: string, variantId?: number) => void;
  itemCount: number;
}

const CartDropdown: React.FC<CartDropdownProps> = ({ cart, changeQty, removeFromCart, itemCount }) => (
  <div className="dropdown dropdown-end dropdown-hover">
    <label
      tabIndex={0}
      aria-label="Shopping cart"
      className="p-2 cursor-pointer transition-colors transition-transform duration-200 hover:text-primary hover:scale-105"
    >
      <div className="relative flex items-center">
        <CartIcon className="w-5 h-5" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 text-xs h-5 w-5 rounded-full flex items-center justify-center bg-red-500 text-white font-bold" style={{ fontSize: '0.85rem' }}>
            {itemCount}
          </span>
        )}
      </div>
    </label>
    <div
      tabIndex={0}
      className="dropdown-content card card-compact w-80 sm:w-96 bg-base-100 shadow z-50"
    >
      <div className="card-body p-4">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-sm mb-2">Your cart is empty</p>
            <Link href="/products" className="btn btn-primary btn-sm">Start Shopping</Link>
          </div>
        ) : (
          <div className="flex flex-col h-72">
            <ul className="flex-1 overflow-y-auto divide-y divide-base-200 text-sm space-y-1">
              {cart.map((item) => {
                const price = parseFloat(
                  typeof item.minPrice === 'number'
                    ? item.minPrice.toString()
                    : item.minPrice || '0'
                );
                return (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 py-2 px-1 hover:bg-base-200 rounded"
                  >
                    <img
                      src={item.featuredImage?.url || '/placeholder.png'}
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <p
                        className="font-medium text-sm line-clamp-2 break-words"
                        title={item.title}
                      >
                        {item.title}
                      </p>
                      <p className="text-xs mt-0.5">
                        £{price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 min-w-[80px] justify-center">
                      <button
                        type="button"
                        className="btn btn-xs"
                        tabIndex={0}
                        aria-label="Decrease quantity"
                        onFocus={(e) => e.currentTarget.classList.add('ring-2', 'ring-primary')}
                        onBlur={(e) => e.currentTarget.classList.remove('ring-2', 'ring-primary')}
                        onClick={() => changeQty(String(item.id), -1, item.variant?.id)}
                      >
                        -
                      </button>
                      <span className="px-1">{item.qty}</span>
                      <button
                        type="button"
                        className="btn btn-xs"
                        tabIndex={0}
                        aria-label="Increase quantity"
                        onFocus={(e) => e.currentTarget.classList.add('ring-2', 'ring-primary')}
                        onBlur={(e) => e.currentTarget.classList.remove('ring-2', 'ring-primary')}
                        onClick={() => changeQty(String(item.id), 1, item.variant?.id)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-error hover:text-red-600 ml-2"
                      tabIndex={0}
                      aria-label="Remove from cart"
                      onFocus={(e) => e.currentTarget.classList.add('ring-2', 'ring-primary')}
                      onBlur={(e) => e.currentTarget.classList.remove('ring-2', 'ring-primary')}
                      onClick={() => removeFromCart(String(item.id), item.variant?.id)}
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span className="sr-only">Remove</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="pt-2 mt-2 border-t">
              <p className="font-semibold">
                Total: £
                {cart
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
              </p>
              <Link
                href="/cart"
                className="btn btn-primary btn-sm w-full mt-2"
              >
                View Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default CartDropdown; 