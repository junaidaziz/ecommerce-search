import { useContext } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import { AppContext } from '@contexts/AppContext';
import { CartItem, CartTotals, CartActions } from '@components/Cart';

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
    <div className="max-w-4xl mx-auto min-h-screen p-4 sm:p-6 lg:p-8">
      <Head>
        <title>{getPageTitle('Cart')}</title>
      </Head>
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Shopping Cart
        </h1>
        {cart.length > 0 && (
          <p className="text-gray-600 dark:text-gray-400">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        )}
      </div>

      {/* Empty State */}
      {cart.length === 0 && (
        <div className="text-center py-12">
          <div className="mb-4">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start shopping to add items to your cart
          </p>
          <button
            className="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-light transition-colors"
            onClick={() => router.push('/')}
          >
            Continue Shopping
          </button>
        </div>
      )}

      {/* Cart Items */}
      {cart.length > 0 && (
        <div className="space-y-6">
          <ul className="space-y-4">
            {cart.map((item) => (
              <CartItem
                key={`${item.id}-${item.variant?.id || 'no-variant'}`}
                item={item}
                onChangeQty={changeQty}
                onRemove={removeFromCart}
              />
            ))}
          </ul>

          {/* Totals and Actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <CartTotals
              itemCount={itemCount}
              subtotal={totalPrice}
              shipping={shippingCost}
              total={totalPrice + shippingCost}
            />
            <CartActions
              onEmptyCart={clearCart}
              onCheckout={() => router.push('/checkout')}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
