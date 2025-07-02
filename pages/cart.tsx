import { useContext } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import { AppContext } from '@contexts/AppContext';
import type { AppContextValue } from '../types';

// Define the type for a cart item
type CartItem = {
  id: string | number;
  title: string;
  minPrice?: string;
  qty: number;
};

const Cart: React.FC = () => {
  const router = useRouter();
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      'AppContext is undefined. Make sure your component is wrapped in an AppContext.Provider.'
    );
  }

  const { cart, changeQty, removeFromCart, clearCart } = context;

  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce(
    (sum, item) =>
      sum +
      item.qty *
        parseFloat(
          typeof item.minPrice === 'number'
            ? item.minPrice.toString()
            : item.minPrice || '0'
        ),
    0
  );
  const shippingCost = cart.length > 0 ? 5 : 0;

  return (
    <div className="max-w-3xl mx-auto min-h-screen p-4">
      <Head>
        <title>{getPageTitle('Cart')}</title>
      </Head>
      <h1 className="text-3xl font-bold mb-4">Summary</h1>
      {cart.length === 0 && <p>Your cart is empty.</p>}
      <ul className="space-y-4 mb-6">
        {cart.map((item) => {
          const price = parseFloat(
            typeof item.minPrice === 'number'
              ? item.minPrice.toString()
              : item.minPrice || '0'
          );
          const subtotal = price * item.qty;
          return (
            <li
              key={item.id}
              className="bg-base-100 border p-4 rounded shadow flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-500">
                  £{price.toFixed(2)} each
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-end">
                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-xs"
                    onClick={() =>
                      changeQty(item.id as string, -1, item.variant?.id)
                    }
                  >
                    -
                  </button>
                  <span>{item.qty}</span>
                  <button
                    className="btn btn-xs"
                    onClick={() =>
                      changeQty(item.id as string, 1, item.variant?.id)
                    }
                  >
                    +
                  </button>
                </div>
                <span className="font-semibold">£{subtotal.toFixed(2)}</span>
                <button
                  className="btn btn-ghost btn-xs text-gray-500 hover:bg-red-200"
                  onClick={() =>
                    removeFromCart(item.id as string, item.variant?.id)
                  }
                  aria-label="Remove"
                >
                  🗑️
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {cart.length > 0 && (
        <div className="border-t pt-4 space-y-2">
          <div>
            <p className="font-semibold">Total Items: {itemCount}</p>
            <p className="font-semibold">Subtotal: £{totalPrice.toFixed(2)}</p>
            <p className="font-semibold">
              Estimated Shipping: £{shippingCost.toFixed(2)}
            </p>
            <p className="font-semibold">
              Total: £{(totalPrice + shippingCost).toFixed(2)}
            </p>
          </div>
          <div className="flex justify-between">
            <button className="btn btn-outline" onClick={clearCart}>
              Empty Cart
            </button>
            <button
              className="btn btn-primary"
              onClick={() => router.push('/checkout')}
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
