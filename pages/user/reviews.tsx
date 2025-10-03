import { useEffect, useState } from 'react';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import type { Review } from '@/types';

const UserReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  useEffect(() => {
    fetch('/api/user/reviews')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Head>
        <title>{getPageTitle('Your Reviews')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Your Reviews</h1>
      <ul className="space-y-2">
        {reviews.map((r, idx) => (
          <li key={idx} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <p className="font-semibold text-gray-900 dark:text-gray-100">Product: {r.productId}</p>
            <p className="text-gray-700 dark:text-gray-300">Rating: {r.rating}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{r.comment}</p>
          </li>
        ))}
        {reviews.length === 0 && <li className="text-gray-500 dark:text-gray-400">No reviews yet.</li>}
      </ul>
    </div>
  );
};

export default UserReviews;
