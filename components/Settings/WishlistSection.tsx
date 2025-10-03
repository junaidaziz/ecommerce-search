import { useContext } from 'react';
import { AppContext } from '@contexts/AppContext';
import Link from 'next/link';
import type { AppContextValue, WishlistItem } from '@/types';

const WishlistSection: React.FC = () => {
  const context = useContext<AppContextValue | undefined>(AppContext);

  if (!context) {
    return null;
  }

  const { wishlist, addToCart, removeFromWishlist, addToWishlist } = context;

  const formatCurrency = (amount: number, currency = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Wishlist</h2>
      
      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your Wishlist is Empty</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Save items you love for later!</p>
          <Link
            href="/products"
            className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {wishlist.map((item: WishlistItem) => (
            <div
              key={item.id}
              className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {item.product?.images?.[0] && (
                  <div className="w-20 h-20 flex-shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="font-semibold text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary-light transition-colors"
                  >
                    {item.product.title}
                  </Link>
                  
                  <div className="mt-2 flex items-center gap-2">
                    {item.product.quantity > 0 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        In Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  
                  <label className="flex items-center gap-2 mt-3 text-sm text-gray-600 dark:text-gray-400 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={item.notifyOnStock}
                      onChange={() => addToWishlist(item.product, !item.notifyOnStock)}
                      className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors">
                      Notify me when back in stock
                    </span>
                  </label>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {item.product.minPrice && formatCurrency(item.product.minPrice, item.product.currency)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(item.product)}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-all"
                      disabled={item.product.quantity <= 0}
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.product.id)}
                      className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistSection;
