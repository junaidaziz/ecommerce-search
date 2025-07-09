import { useContext, useCallback, useEffect, useState, useRef } from 'react';
import { AppContext } from '@contexts/AppContext';
import { Vendor, UserRole, ApiMessage, USER_ROLES } from '@/types';
import { fetchJson } from '@utils/fetchJson';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import Pagination from '@components/Pagination';
import ConfirmModal from '@components/Modals/ConfirmModal';
import SuperAdminSidebar from '@components/Layout/SuperAdminSidebar';
import AdminPanelLayout from '@components/Layout/AdminPanelLayout';
import PageHero from '@components/UI/PageHero';
import InputField from '@components/UI/InputField';
import Checkbox from '@components/form-fields/Checkbox';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

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
  const [editBrand, setEditBrand] = useState<Vendor | null>(null);
  const [editBrandName, setEditBrandName] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  // Add state for edit mode toggling
  const [editMode, setEditMode] = useState(false);
  const [editActive, setEditActive] = useState(true);
  const [editVerified, setEditVerified] = useState(false);

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
  const handleEdit = (brand: Vendor) => {
    setEditBrand(brand);
    setEditBrandName(brand.brandName || '');
    setEditActive(brand.active ?? true);
    setEditVerified(brand.verified ?? false);
    setEditMode(false);
    setTimeout(() => editInputRef.current?.focus(), 100);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBrand) return;
    setEditLoading(true);
    try {
      await fetchJson<ApiMessage>('/api/admin/brands', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editBrand.id,
          brandName: editBrandName,
          active: editActive,
          verified: editVerified,
        }),
      });
      setMessage('Brand updated successfully');
      setEditBrand(null);
      load();
    } catch (error) {
      setMessage('Failed to update brand');
    } finally {
      setEditLoading(false);
    }
  };

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
    <>
      <Head>
        <title>{getPageTitle('Manage Brands')}</title>
      </Head>
      <PageHero
        heading="Brand Management"
        description="Manage all brands and vendor accounts across the platform. View, edit, and maintain brand information."
      />
      <main className="bg-gray-50 min-h-screen pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-10 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">All Brands</h2>
                <p className="text-gray-600">Total: {totalBrands} brands</p>
              </div>
            </div>
            <div className="mb-8">
              <div className="bg-gray-50 rounded-xl shadow p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <form onSubmit={handleSearch} className="w-full md:w-auto flex-1">
                  <div className="flex gap-2 w-full">
                    <input 
                      type="text" 
                      placeholder="Search brands..." 
                      value={search} 
                      onChange={(e) => setSearch(e.target.value)} 
                      className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 px-4 py-2 text-base bg-white placeholder-gray-400 transition"
                    />
                    <button type="submit" className="btn btn-primary text-white px-5 py-2 rounded-lg shadow">Search</button>
                  </div>
                </form>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)} 
                  className="rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 px-4 py-2 text-base bg-white min-w-[180px] w-full md:w-auto transition"
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
              <div className="alert alert-success mb-6 rounded-lg shadow flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 text-green-800">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{message}</span>
              </div>
            )}
            <div className="bg-white rounded-xl shadow border border-gray-100 overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-green-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Brand</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Verified</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-6 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <span className="ml-2">Loading brands...</span>
                        </div>
                      </td>
                    </tr>
                  ) : brands.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                        No brands found
                      </td>
                    </tr>
                  ) : (
                    brands.map((brand, idx) => (
                      <tr key={brand.id} className={`transition-colors duration-150 group ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 h-12 w-12">
                              {brand.logo ? (
                                <img 
                                  className="h-12 w-12 rounded-lg object-cover" 
                                  src={brand.logo} 
                                  alt={brand.brandName || 'Brand'} 
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-lg uppercase">
                                  {(brand.brandName || brand.email || 'B')?.[0]?.toUpperCase() || 'B'}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-base font-semibold text-gray-900 leading-tight">{brand.brandName || '(no name)'}</div>
                              <div className="text-xs text-gray-400 font-mono">ID: {brand.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-emerald-100 text-emerald-700">Brand</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${brand.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{brand.active ? 'Active' : 'Inactive'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${brand.verified ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{brand.verified ? 'Verified' : 'Unverified'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(brand)}
                              className="flex items-center gap-1 btn btn-sm bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 hover:text-blue-900 font-semibold rounded-lg shadow-sm transition px-3 py-1.5"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(Number(brand.id))}
                              disabled={deleting === Number(brand.id)}
                              className="flex items-center gap-1 btn btn-sm bg-red-500 text-white hover:bg-red-600 font-semibold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition px-3 py-1.5"
                            >
                              <TrashIcon className="w-4 h-4" />
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
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </main>
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
      {/* Edit Brand Modal */}
      {editBrand && (
        <dialog open className="modal">
          <form onSubmit={submitEdit} className="modal-box max-w-md">
            <h3 className="font-bold text-2xl mb-1">Edit Brand</h3>
            <p className="text-gray-500 mb-4">Update the brand&apos;s name, status, and verification below.</p>
            <div className="border-b border-gray-200 mb-4"></div>
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <InputField
                  label="Brand Name"
                  name="brandName"
                  value={editBrandName}
                  onChange={e => setEditBrandName(e.target.value)}
                  disabled={!editMode}
                  required
                  className="flex-1"
                  ref={editInputRef}
                />
                {!editMode ? (
                  <button
                    type="button"
                    className="btn btn-outline px-3 py-2"
                    onClick={() => setEditMode(true)}
                    tabIndex={-1}
                  >
                    Edit
                  </button>
                ) : null}
              </div>
              <Checkbox
                label="Active"
                name="active"
                checked={editActive}
                onChange={e => setEditActive(e.target.checked)}
              />
              <Checkbox
                label="Verified"
                name="verified"
                checked={editVerified}
                onChange={e => setEditVerified(e.target.checked)}
              />
            </div>
            <div className="modal-action mt-8 flex gap-2">
              <button
                type="button"
                className="btn btn-outline flex-1"
                onClick={() => setEditBrand(null)}
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary text-white flex-1"
                disabled={editLoading || (!editBrandName.trim() && editMode)}
              >
                {editLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </dialog>
      )}
    </>
  );
}

(ManageBrands as any).getLayout = (page: React.ReactNode) => <AdminPanelLayout>{page}</AdminPanelLayout>;
