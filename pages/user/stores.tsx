import { useEffect, useState } from 'react';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';

const FollowedStores: React.FC = () => {
  const [stores, setStores] = useState<string[]>([]);
  useEffect(() => {
    fetch('/api/user/stores')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setStores(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Head>
        <title>{getPageTitle('Followed Stores')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Followed Stores</h1>
      <ul className="space-y-2">
        {stores.map((s) => (
          <li key={s} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 text-gray-900 dark:text-gray-100">
            {s}
          </li>
        ))}
        {stores.length === 0 && <li className="text-gray-500 dark:text-gray-400">No followed stores.</li>}
      </ul>
    </div>
  );
};

export default FollowedStores;
