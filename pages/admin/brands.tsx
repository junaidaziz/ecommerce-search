import { useContext, useCallback, useEffect, useState } from 'react';
import { AppContext } from '@contexts/AppContext';
import { Vendor, UserRole, ApiMessage } from '@/types';
import { fetchJson } from '@utils/fetchJson';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';

export default function ManageBrands() {
  const { user } = useContext(AppContext)!;
  const [brands, setBrands] = useState<Vendor[]>([]);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const data = await fetchJson<Vendor[]>(`/api/admin/brands?${params.toString()}`);
    setBrands(data);
  }, [user, search]);

  const toggleActive = async (id: number, active: boolean) => {
    await fetchJson<ApiMessage>('/api/admin/brands', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active }),
    });
    load();
  };

  useEffect(() => {
    load();
  }, [load]);

  if (!user) return <div className="p-4">Please log in to view brands.</div>;
  if (user.role.toUpperCase() !== UserRole.SUPER_ADMIN)
    return <div className="p-4">Admin access required.</div>;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <Head>
        <title>{getPageTitle('Manage Brands')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Brands</h1>
      <input
        type="text"
        placeholder="Search"
        className="input input-bordered mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul className="space-y-2">
        {brands.map((b) => (
          <li key={b.id} className="flex items-center justify-between border-b pb-1">
            <span>{b.brandName || '(no name)'}</span>
            <span className="text-sm text-gray-500">{b.email}</span>
            <label className="label cursor-pointer gap-1">
              <span className="label-text">Active</span>
              <input
                type="checkbox"
                className="checkbox"
                checked={b.active ?? true}
                onChange={(e) => toggleActive(Number(b.id), e.target.checked)}
              />
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
