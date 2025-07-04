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
    <div className="max-w-2xl mx-auto">
      <Head>
        <title>{getPageTitle('Followed Stores')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Followed Stores</h1>
      <ul className="space-y-2">
        {stores.map((s) => (
          <li key={s} className="border p-2">
            {s}
          </li>
        ))}
        {stores.length === 0 && <li>No followed stores.</li>}
      </ul>
    </div>
  );
};

export default FollowedStores;
