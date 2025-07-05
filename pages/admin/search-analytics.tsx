import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@contexts/AppContext';
import Link from 'next/link';
import { SearchAnalyticsResponse, UserRole } from '@/types';
import { fetchJson } from '@utils/fetchJson';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';

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
  if (user.role !== UserRole.SUPER_ADMIN)
    return <div className="p-4">Admin access required.</div>;
  if (!data) return <div className="p-4">Loading...</div>;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <Head>
        <title>{getPageTitle('Search Analytics')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Search Analytics</h1>
      <div className="mb-4 space-x-2">
        <Link href="/admin/analytics" className="btn btn-sm">
          Back
        </Link>
      </div>
      <h2 className="text-xl font-semibold mt-4 mb-2">Top Searches</h2>
      <ul className="list-disc list-inside">
        {data.topSearches.map((s) => (
          <li key={s.query}>
            {s.query} - {s.count}
          </li>
        ))}
        {data.topSearches.length === 0 && <li>No searches yet.</li>}
      </ul>
      <h2 className="text-xl font-semibold mt-4 mb-2">No Result Searches</h2>
      <ul className="list-disc list-inside">
        {data.failedSearches.map((s) => (
          <li key={s.query}>
            {s.query} - {s.count}
          </li>
        ))}
        {data.failedSearches.length === 0 && <li>None.</li>}
      </ul>
    </div>
  );
}
