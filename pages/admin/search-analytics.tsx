import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@contexts/AppContext';
import Link from 'next/link';
import { SearchAnalyticsResponse, UserRole, USER_ROLES } from '@/types';
import { fetchJson } from '@utils/fetchJson';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import PageHero from '@components/UI/PageHero';

export default function SearchAnalytics() {
  const { user } = useContext(AppContext)!;
  const [data, setData] = useState<SearchAnalyticsResponse | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchJson<SearchAnalyticsResponse>('/api/admin/search-analytics')
      .then(setData)
      .catch(() => setData(null));
  }, [user]);

  if (!user) return <div className="p-4">Please log in to view analytics.</div>;
  if (user.role !== USER_ROLES.SUPER_ADMIN)
    return <div className="p-4">Admin access required.</div>;
  if (!data) return <div className="p-4">Loading...</div>;

  return (
    <>
      <Head>
        <title>{getPageTitle('Search Analytics')}</title>
      </Head>
      <PageHero heading="Search Analytics" />
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-4 space-x-2">
          <Link href="/admin/analytics" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors inline-block">
            Back
          </Link>
        </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100">Top Searches</h2>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
          {data.topSearches.map((s) => (
            <li key={s.query}>
              {s.query} - {s.count}
            </li>
          ))}
          {data.topSearches.length === 0 && <li className="text-gray-500 dark:text-gray-400">No searches yet.</li>}
        </ul>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100">No Result Searches</h2>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
          {data.failedSearches.map((s) => (
            <li key={s.query}>
              {s.query} - {s.count}
            </li>
          ))}
          {data.failedSearches.length === 0 && <li className="text-gray-500 dark:text-gray-400">None.</li>}
        </ul>
      </div>
    </div>
    </>
  );
}
