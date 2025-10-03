import { useCallback, useContext, useEffect, useState } from 'react';
import { AppContext } from '@contexts/AppContext';
import { PendingProduct, ApiMessage, UserRole, USER_ROLES } from '@/types';
import { fetchJson } from '@utils/fetchJson';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import PageHero from '@components/UI/PageHero';

export default function Approvals() {
  const { user } = useContext(AppContext)!;
  const [pending, setPending] = useState<PendingProduct[]>([]);
  const [message, setMessage] = useState<string>('');

  const load = useCallback(async () => {
    if (!user) return;
    const data = await fetchJson<PendingProduct[]>(
      '/api/admin/vendor-products'
    );
    setPending(data);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id: string, action: 'approve' | 'reject') => {
    await fetchJson<ApiMessage>('/api/admin/vendor-products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    });
    setMessage('Updated');
    load();
  };

  if (!user)
    return <div className="p-4">Please log in to view vendor products.</div>;
  if (user.role.toUpperCase() !== USER_ROLES.SUPER_ADMIN)
    return <div className="p-4">Admin access required.</div>;

  return (
    <>
      <Head>
        <title>{getPageTitle('Vendor Approvals')}</title>
      </Head>
      <PageHero heading="Vendor Product Approvals" />
      {message && <div className="mb-4 text-green-600 dark:text-green-400 px-4 sm:px-6 lg:px-8">{message}</div>}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <ul className="space-y-2">
        {pending.map((p) => (
          <li key={p.id} className="flex justify-between items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <span className="text-gray-900 dark:text-gray-100">{p.title}</span>
            <div className="flex gap-2">
              <button
                onClick={() => act(p.id, 'approve')}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 rounded-lg transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => act(p.id, 'reject')}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 rounded-lg transition-colors"
              >
                Reject
              </button>
            </div>
          </li>
        ))}
        {pending.length === 0 && <li className="text-gray-500 dark:text-gray-400">No pending products.</li>}
        </ul>
      </div>
    </>
  );
}
