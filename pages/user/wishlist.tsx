import React, { useContext } from 'react';
import { AppContext } from '@contexts/AppContext';
import type { AppContextValue } from '@/types';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import ProductCard from '@components/Product/ProductCard';

const UserWishlist: React.FC = () => {
  const context = useContext<AppContextValue | undefined>(AppContext);

  if (!context || !context.user) {
    return <div className="p-4">Please log in to view wishlist.</div>;
  }

  const { wishlist, addToWishlist, removeFromWishlist } = context;

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>{getPageTitle('My Wishlist')}</title>
      </Head>
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">My Wishlist</h1>
      
      {wishlist.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-gray-600 dark:text-gray-400">No items in wishlist.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
          {wishlist.map((item) => (
            <ProductCard
              key={item.id}
              product={item.product}
              className="w-full h-full transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl"
              inWishlist={true}
              addToWish={addToWishlist}
              removeFromWish={(id) => removeFromWishlist(Number(id))}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserWishlist;
