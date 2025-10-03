import { useEffect, useState } from 'react';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';

interface HistoryItem {
  id: string;
  title: string;
}

const BrowsingHistory: React.FC = () => {
  const [items, setItems] = useState<HistoryItem[]>([]);
  useEffect(() => {
    fetch('/api/user/history')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Head>
        <title>{getPageTitle('Browsing History')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Browsing History</h1>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 text-gray-900 dark:text-gray-100">
            {i.title}
          </li>
        ))}
        {items.length === 0 && <li className="text-gray-500 dark:text-gray-400">No history available.</li>}
      </ul>
    </div>
  );
};

export default BrowsingHistory;
