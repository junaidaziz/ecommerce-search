import { useContext, useCallback, useEffect, useState } from 'react';
import { AppContext } from '@contexts/AppContext';
import { Vendor, UserRole, ApiMessage, USER_ROLES } from '@/types';
import { fetchJson } from '@utils/fetchJson';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import Pagination from '@components/Pagination';

export default function ManageBrands() {
  const { user } = useContext(AppContext)!;
  const [brands, setBrands] = useState<Vendor[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBrands, setTotalBrands] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', currentPage.toString());
      params.set('limit', '10');
      
      const data = await fetchJson<{
        brands: Vendor[];
        total: number;
        totalPages: number;
      }>(`/api/admin/brands?${params.toString()}`);
      
      setBrands(data.brands);
      setTotalBrands(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to load brands:', error);
    } finally {
      setLoading(false);
    }
  }, [user, search, currentPage]);

  const toggleActive = async (id: number, active: boolean) => {
    try {
      await fetchJson<ApiMessage>('/api/admin/brands', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active }),
      });
      load();
    } catch (error) {
      console.error('Failed to toggle brand status:', error);
    }
  };

  const deleteBrand = async (id: number) => {
    setDeleting(id);
    try {
      await fetchJson<ApiMessage>(`/api/admin/brands/${id}`, {
        method: 'DELETE',
      });
      setConfirmDeleteId(null);
      load();
    } catch (error) {
      console.error('Failed to delete brand:', error);
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  if (!user) return <div className="p-4">Please log in to view brands.</div>;
  if (user.role.toUpperCase() !== USER_ROLES.SUPER_ADMIN)
    return <div className="p-4">Admin access required.</div>;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <Head>
        <title>{getPageTitle('Manage Brands')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Brands</h1>
      <input
        type="text"
        placeholder="Search brands..."
        className="input input-bordered mb-4 w-full max-w-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      {loading ? (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {brands.length} of {totalBrands} brands
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Brand Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <tr key={brand.id}>
                    <td className="font-medium">{brand.brandName || '(no name)'}</td>
                    <td className="text-sm text-gray-600">{brand.email}</td>
                    <td>
                      <label className="label cursor-pointer gap-2">
                        <span className="label-text text-sm">Active</span>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={brand.active ?? true}
                          onChange={(e) => toggleActive(Number(brand.id), e.target.checked)}
                        />
                      </label>
                    </td>
                    <td>
                      <button
                        onClick={() => setConfirmDeleteId(Number(brand.id))}
                        disabled={deleting === Number(brand.id)}
                        className="btn btn-error btn-sm text-white"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}

          {/* Confirmation Modal */}
          {confirmDeleteId !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-base-100 rounded-lg shadow-lg p-6 w-full max-w-sm">
                <h2 className="text-lg font-bold mb-2">Confirm Delete</h2>
                <p className="mb-4">
                  Are you sure you want to delete brand
                  <span className="font-bold text-red-600"> {' '}
                    {brands.find(b => b.id === confirmDeleteId)?.brandName || '(no name)'}
                  </span>?
                  <br />This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    className="btn btn-ghost"
                    onClick={() => setConfirmDeleteId(null)}
                    disabled={deleting === confirmDeleteId}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-error text-white"
                    onClick={() => deleteBrand(confirmDeleteId!)}
                    disabled={deleting === confirmDeleteId}
                  >
                    {deleting === confirmDeleteId ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
