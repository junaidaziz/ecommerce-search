import React, { useContext } from 'react';
import Link from 'next/link';
import { AppContext } from '@contexts/AppContext';
import type { AppContextValue, WishlistItem } from '@/types';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';

const UserWishlist: React.FC = () => {
  const context = useContext<AppContextValue | undefined>(AppContext);

  if (!context || !context.user) {
    return <div className="p-4">Please log in to view wishlist.</div>;
  }

  const { wishlist, addToCart, removeFromWishlist, addToWishlist } = context;

  return (
    <div className="max-w-2xl mx-auto">
      <Head>
        <title>{getPageTitle('My Wishlist')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">My Wishlist</h1>
      <ul className="space-y-2">
        {wishlist.map((item: WishlistItem) => (
          <li
            key={item.id}
            className="border p-2 flex justify-between items-center"
          >
            <div>
              <Link
                href={`/product/${item.product.slug}`}
                className="font-semibold"
              >
                {item.product.title}
              </Link>
              <div className="text-sm">
                {item.product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
              </div>
              <label className="flex items-center gap-1 mt-1 text-sm">
                <input
                  type="checkbox"
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
                className="btn btn-sm"
                onClick={() => addToCart(item.product)}
              >
                Add to Cart
              </button>
              <button
                className="btn btn-sm"
                onClick={() => removeFromWishlist(item.product.id)}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
        {wishlist.length === 0 && <li>No items in wishlist.</li>}
      </ul>
    </div>
  );
};

export default UserWishlist;
