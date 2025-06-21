import React, { useContext } from 'react';
import Link from 'next/link';
import { AppContext, AppContextValue } from '../../contexts/AppContext';

const UserWishlist: React.FC = () => {
  const context = useContext<AppContextValue | undefined>(AppContext);

  if (!context || !context.user) {
    return <div className="p-4">Please log in to view wishlist.</div>;
  }

  const { wishlist, addToCart, removeFromWishlist } = context;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Wishlist</h1>
      <ul className="space-y-2">
        {wishlist.map((item) => (
          <li
            key={item.id}
            className="border p-2 flex justify-between items-center"
          >
            <div>
              <Link href={`/product/${item.slug}`} className="font-semibold">
                {item.title}
              </Link>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-sm" onClick={() => addToCart(item)}>
                Add to Cart
              </button>
              <button
                className="btn btn-sm"
                onClick={() => removeFromWishlist(item.id)}
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
