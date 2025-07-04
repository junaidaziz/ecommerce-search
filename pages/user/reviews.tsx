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
    <div className="max-w-2xl mx-auto">
      <Head>
        <title>{getPageTitle('Your Reviews')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Your Reviews</h1>
      <ul className="space-y-2">
        {reviews.map((r, idx) => (
          <li key={idx} className="border p-2">
            <p className="font-semibold">Product: {r.productId}</p>
            <p>Rating: {r.rating}</p>
            <p className="text-sm text-gray-600">{r.comment}</p>
          </li>
        ))}
        {reviews.length === 0 && <li>No reviews yet.</li>}
      </ul>
    </div>
  );
};

export default UserReviews;
