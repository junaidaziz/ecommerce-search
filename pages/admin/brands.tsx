import { useContext, useCallback, useEffect, useState } from 'react';
import { AppContext } from '@contexts/AppContext';
import { Vendor, UserRole, ApiMessage, USER_ROLES } from '@/types';
import { fetchJson } from '@utils/fetchJson';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import Pagination from '@components/Pagination';
import ConfirmModal from '@components/Modals/ConfirmModal';

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
  const [message, setMessage] = useState<string>('');
  const [sortBy, setSortBy] = useState('newest');
  const [confirmAction, setConfirmAction] = useState<null | { type: 'delete' | 'toggle' | 'verify', payload: any }>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', currentPage.toString());
      params.set('limit', '20');
      if (sortBy) params.set('sort', sortBy);
      
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
      setBrands([]);
      setTotalBrands(0);
    } finally {
      setLoading(false);
    }
  }, [user, search, currentPage, sortBy]);

  const handleDelete = (id: number) => setConfirmAction({ type: 'delete', payload: id });
  const handleToggleActive = (id: number, active: boolean) => setConfirmAction({ type: 'toggle', payload: { id, active } });
  const handleToggleVerified = (id: number, verified: boolean) => setConfirmAction({ type: 'verify', payload: { id, verified } });

  const toggleActive = async (id: number, active: boolean) => {
    try {
      await fetchJson<ApiMessage>('/api/admin/brands', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active }),
      });
      setMessage('Brand status updated successfully');
      load();
    } catch (error) {
      console.error('Failed to toggle brand status:', error);
      setMessage('Failed to update brand status');
    }
  };

  const toggleVerified = async (id: number, verified: boolean) => {
    try {
      await fetchJson<ApiMessage>('/api/admin/brands', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, verified }),
      });
      setMessage('Brand verification status updated successfully');
      load();
    } catch (error) {
      console.error('Failed to toggle brand verification:', error);
      setMessage('Failed to update brand verification status');
    }
  };

  const deleteBrand = async (id: number) => {
    setDeleting(id);
    try {
      await fetchJson<ApiMessage>(`/api/admin/brands/${id}`, {
        method: 'DELETE',
      });
      setConfirmDeleteId(null);
      setMessage('Brand deleted successfully');
      load();
    } catch (error) {
      console.error('Failed to delete brand:', error);
      setMessage('Failed to delete brand');
    } finally {
      setDeleting(null);
    }
  };

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleSearch = (e: React.FormEvent) => { 
    e.preventDefault(); 
    setCurrentPage(1); 
    load(); 
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-indigo-50">
      <Head>
        <title>{getPageTitle('Manage Brands')}</title>
      </Head>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Brand Management</h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">Manage all brands and vendor accounts across the platform. View, edit, and maintain brand information.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All Brands</h2>
              <p className="text-gray-600">Total: {totalBrands} brands</p>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <form onSubmit={handleSearch}>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Search brands..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  className="input input-bordered flex-1" 
                />
                <button type="submit" className="btn btn-primary text-white">Search</button>
              </div>
            </form>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)} 
              className="select select-bordered"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name_asc">Name A-Z</option>
              <option value="name_desc">Name Z-A</option>
              <option value="email_asc">Email A-Z</option>
              <option value="email_desc">Email Z-A</option>
            </select>
          </div>
        </div>

        {message && (
          <div className="alert alert-success mb-6">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{message}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="loader"></div>
                      </div>
                    </td>
                  </tr>
                ) : brands.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No brands found
                    </td>
                  </tr>
                ) : (
                  brands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {brand.logo ? (
                              <img 
                                className="h-12 w-12 rounded-lg object-cover" 
                                src={brand.logo} 
                                alt={brand.brandName || 'Brand'} 
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm uppercase">
                                {(brand.brandName || brand.email || 'B')?.[0]?.toUpperCase() || 'B'}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {brand.brandName || '(no name)'}
                            </div>
                            <div className="text-sm text-gray-500">ID: {brand.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {brand.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <label className="label cursor-pointer gap-2">
                          <span className="label-text text-sm">Active</span>
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={brand.active ?? true}
                            onChange={(e) => handleToggleActive(Number(brand.id), e.target.checked)}
                          />
                        </label>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <label className="label cursor-pointer gap-2">
                          <span className="label-text text-sm">Verified</span>
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={brand.verified ?? false}
                            onChange={(e) => handleToggleVerified(Number(brand.id), e.target.checked)}
                          />
                        </label>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDelete(Number(brand.id))}
                            disabled={deleting === Number(brand.id)}
                            className="btn btn-error text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Confirmation Modals */}
        {confirmDeleteId !== null && (
          <ConfirmModal
            isOpen={!!confirmDeleteId}
            title="Confirm Delete"
            description={`Are you sure you want to delete brand ${brands.find(b => b.id === confirmDeleteId)?.brandName || '(no name)'}? This action cannot be undone.`}
            confirmLabel="Delete"
            cancelLabel="Cancel"
            onConfirm={() => {
              deleteBrand(confirmDeleteId!);
              setConfirmDeleteId(null);
            }}
            onCancel={() => setConfirmDeleteId(null)}
          />
        )}
        {confirmAction && (
          <ConfirmModal
            isOpen={!!confirmAction}
            title={`Confirm ${confirmAction.type.charAt(0).toUpperCase() + confirmAction.type.slice(1)}`}
            description={
              confirmAction.type === 'toggle'
                ? confirmAction.payload.active
                  ? 'Are you sure you want to activate this brand?'
                  : 'Are you sure you want to deactivate this brand?'
                : confirmAction.type === 'verify'
                ? confirmAction.payload.verified
                  ? 'Are you sure you want to mark this brand as verified?'
                  : 'Are you sure you want to unmark this brand as verified?'
                : `Are you sure you want to ${confirmAction.type} this brand?`
            }
            confirmLabel="Confirm"
            cancelLabel="Cancel"
            onConfirm={() => {
              if (confirmAction.type === 'delete') {
                deleteBrand(confirmAction.payload);
              } else if (confirmAction.type === 'toggle') {
                toggleActive(confirmAction.payload.id, confirmAction.payload.active);
              } else if (confirmAction.type === 'verify') {
                toggleVerified(confirmAction.payload.id, confirmAction.payload.verified);
              }
              setConfirmAction(null);
            }}
            onCancel={() => setConfirmAction(null)}
          />
        )}
      </div>
    </div>
  );
}
