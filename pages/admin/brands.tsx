import { useContext, useCallback, useEffect, useState } from 'react';
import { AppContext } from '@contexts/AppContext';
import type { Vendor } from '@/types';
import { UserRole } from '@/types';
import { fetchJson } from '@utils/fetchJson';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';

export default function ManageBrands() {
  const { user } = useContext(AppContext)!;
  const [brands, setBrands] = useState<Vendor[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const data = await fetchJson<{ vendors: Vendor[] }>('/api/vendors');
    setBrands(data.vendors);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  if (!user) return <div className="p-4">Please log in to view brands.</div>;
  if (user.role !== UserRole.SUPER_ADMIN)
    return <div className="p-4">Admin access required.</div>;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <Head>
        <title>{getPageTitle('Manage Brands')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Brands</h1>
      <ul className="space-y-2">
        {brands.map((b) => (
          <li key={b.id} className="flex justify-between border-b pb-1">
            <span>{b.brandName || '(no name)'}</span>
            <span className="text-sm text-gray-500">{b.email}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
