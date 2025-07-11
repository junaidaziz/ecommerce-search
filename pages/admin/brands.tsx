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
import SearchFilterBar from '@components/common/SearchFilterBar';
import GenericModal from '@components/Modals/GenericModal';

const brandSortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Name A-Z', value: 'name_asc' },
  { label: 'Name Z-A', value: 'name_desc' },
  { label: 'Email A-Z', value: 'email_asc' },
  { label: 'Email Z-A', value: 'email_desc' },
];

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
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  if (!user) return <div className="p-4">Please log in to view brands.</div>;
  if (user.role.toUpperCase() !== USER_ROLES.SUPER_ADMIN)
    return <div className="p-4">Admin access required.</div>;

  return (
    <>
      <Head>
        <title>{getPageTitle('Manage Brands')}</title>
      </Head>
      {/* Hero Section */}
      <PageHero
        heading="Brand Management"
        description="Manage all brands and vendor accounts across the platform. View, edit, and maintain brand information."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-950 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-800 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Brands</h2>
              <p className="text-gray-600 dark:text-gray-300">Total: {totalBrands} brands</p>
            </div>
          </div>
        </div>
        <div className="mb-8">
          <SearchFilterBar
            searchValue={search}
            onSearchChange={e => setSearch(e.target.value)}
            onSearchSubmit={handleSearch}
            filterValue={brandSortOptions.find(opt => opt.value === sortBy) || brandSortOptions[0]}
            filterOptions={brandSortOptions}
            onFilterChange={val => { if (val) setSortBy(val.value); }}
            placeholder="Search brands..."
            buttonText="Search"
          />
        </div>
        {message && (<div className="alert alert-success mb-6"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg><span>{message}</span></div>)}
        <div className="bg-white dark:bg-gray-950 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-100 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Brand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Verified</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400 dark:text-gray-500">No brands found.</td>
                </tr>
              ) : (
                brands.map((brand, index) => (
                  <tr key={brand.id} className={`transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-950'} border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800`}>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {brand.brandName?.charAt(0).toUpperCase() || brand.email?.charAt(0).toUpperCase() || 'B'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {brand.brandName || 'Unnamed Brand'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {brand.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                        {brand.role?.replace('_', ' ') || 'BRAND'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                        brand.active
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                      }`}>
                        {brand.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                        brand.verified
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                      }`}>
                        {brand.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(brand)}
                          className="flex items-center gap-1 btn btn-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-800 font-semibold rounded-lg shadow-sm transition px-3 py-1.5"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(brand.id)}
                          disabled={deleting === brand.id}
                          className="flex items-center gap-1 btn btn-sm bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700 font-semibold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition px-3 py-1.5"
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
        {totalPages > 1 && (<div className="mt-8 flex justify-center"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} /></div>)}
      </div>

      {/* Edit Brand Modal */}
      {editBrand && (
        <GenericModal
          isOpen={!!editBrand}
          onClose={() => setEditBrand(null)}
          title="Edit Brand"
          onSubmit={submitEdit}
          isSubmitting={editLoading}
          submitText="Save"
          cancelText="Cancel"
          submitButtonClass="btn btn-primary text-white flex-1"
          cancelButtonClass="btn btn-outline flex-1"
          submitDisabled={editLoading || (!editBrandName.trim() && editMode)}
        >
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
        </GenericModal>
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
    </>
  );
}

ManageBrands.getLayout = (page: React.ReactNode) => <AdminPanelLayout>{page}</AdminPanelLayout>;
