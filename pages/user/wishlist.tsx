import { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import Link from 'next/link';

export default function UserWishlist() {
  const { user, wishlist, addToCart, removeFromWishlist } =
    useContext(AppContext)!;

  if (!user) {
    return <div className="p-4">Please log in to view wishlist.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Wishlist</h1>
      <ul className="space-y-2">
        {wishlist.map((item) => (
          <li
            key={item.ID}
            className="border p-2 flex justify-between items-center"
          >
            <div>
              <Link href={`/product/${item.SLUG}`} className="font-semibold">
                {item.TITLE}
              </Link>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-sm" onClick={() => addToCart(item)}>
                Add to Cart
              </button>
              <button
                className="btn btn-sm"
                onClick={() => removeFromWishlist(item.ID)}
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
}
