import React, { useContext } from 'react';
import Link from 'next/link';
import { AppContext } from '@contexts/AppContext';
import type { AppContextValue, WishlistItem } from '@/types';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';

const UserWishlist: React.FC = () => {
  const context = useContext<AppContextValue | undefined>(AppContext);

  if (!context || !context.user) {
    return <div className="p-4 text-gray-700 dark:text-gray-300">Please log in to view wishlist.</div>;
  }

  const { wishlist, addToCart, removeFromWishlist, addToWishlist } = context;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Head>
        <title>{getPageTitle('My Wishlist')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">My Wishlist</h1>
      <ul className="space-y-2">
        {wishlist.map((item: WishlistItem) => (
          <li
            key={item.id}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <Link
                href={`/product/${item.product.slug}`}
                className="font-semibold text-gray-900 dark:text-gray-100 hover:text-primary dark:hover:text-primary-light"
              >
                {item.product.title}
              </Link>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {item.product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
              </div>
              <label className="flex items-center gap-1 mt-1 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 dark:border-gray-700 text-primary focus:ring-primary"
                  checked={item.notifyOnStock}
                  onChange={() =>
                    addToWishlist(item.product, !item.notifyOnStock)
                  }
                />
                Notify when in stock
              </label>
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                onClick={() => addToCart(item.product)}
              >
                Add to Cart
              </button>
              <button
                className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                onClick={() => removeFromWishlist(item.product.id)}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
        {wishlist.length === 0 && <li className="text-gray-500 dark:text-gray-400">No items in wishlist.</li>}
      </ul>
    </div>
  );
};

export default UserWishlist;
