import { useContext, useEffect, useState, useCallback } from 'react';
import { AppContext } from '@contexts/AppContext';
import { Category, ApiMessage, UserRole, USER_ROLES } from '@/types';
import { fetchJson } from '@utils/fetchJson';
import TextInput from '@components/form-fields/TextInput';
import { slugify } from '@lib/slugify';
import { Button } from '@components/UI';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import AdminPanelLayout from '@components/Layout/AdminPanelLayout';
import PageHero from '@components/UI/PageHero';
import ConfirmModal from '@components/Modals/ConfirmModal';
import GenericModal from '@components/Modals/GenericModal';
import SearchFilterBar from '@components/common/SearchFilterBar';

export default function Categories() {
  const { user } = useContext(AppContext)!;
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCat, setNewCat] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<null | { type: 'add' | 'edit' | 'delete', payload?: any }>(null);
  const [editModal, setEditModal] = useState<{ open: boolean; cat: Category | null }>({ open: false, cat: null });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState({ label: 'A-Z', value: 'az' });
  const [addModalOpen, setAddModalOpen] = useState(false);

  const sortOptions = [
    { label: 'A-Z', value: 'az' },
    { label: 'Z-A', value: 'za' },
    { label: 'Newest', value: 'newest' },
    { label: 'Oldest', value: 'oldest' },
  ];

  // Filter and sort categories client-side for now
  const filteredCategories = categories
    .filter(cat => cat.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy.value === 'az') return a.name.localeCompare(b.name);
      if (sortBy.value === 'za') return b.name.localeCompare(a.name);
      if (sortBy.value === 'newest') return b.id - a.id;
      if (sortBy.value === 'oldest') return a.id - b.id;
      return 0;
    });

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchJson<Category[]>('/api/admin/categories');
      setCategories(data);
    } catch (error) {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = () => setConfirmAction({ type: 'add' });
  const handleEdit = (cat: Category) => setConfirmAction({ type: 'edit', payload: cat });
  const handleDelete = (id: number) => setConfirmAction({ type: 'delete', payload: id });

  const add = async () => {
    if (!newCat.trim()) return;
    try {
      const payload = {
        name: newCat,
        slug: slugify(newCat),
      };
      await fetchJson<ApiMessage>('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setNewCat('');
      setMessage('Category added successfully');
      load();
    } catch (error) {
      setMessage('Failed to add category');
    }
  };

  const update = async () => {
    try {
      const payload = {
        uuid: editing as string,
        name: editName,
      };
      await fetchJson<ApiMessage>('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setEditing(null);
      setEditName('');
      setMessage('Category updated successfully');
      load();
    } catch (error) {
      setMessage('Failed to update category');
    }
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await fetchJson<ApiMessage>(`/api/admin/categories?id=${deleteId}`, {
        method: 'DELETE',
      });
      setMessage('Category deleted successfully');
      setDeleteId(null);
      load();
    } catch (error) {
      setMessage('Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  const openEditModal = (cat: Category) => {
    setEditName(cat.name);
    setEditing(cat.id);
    setEditModal({ open: true, cat });
  };
  const closeEditModal = () => {
    setEditModal({ open: false, cat: null });
    setEditing(null);
    setEditName('');
  };
  const saveEdit = async () => {
    await update();
    closeEditModal();
  };

  if (!user)
    return <div className="p-4">Please log in to view categories.</div>;
  if (user.role.toUpperCase() !== USER_ROLES.SUPER_ADMIN)
    return <div className="p-4">Admin access required.</div>;

  return (
    <>
      <Head>
        <title>{getPageTitle('Manage Categories')}</title>
      </Head>
      {/* Hero Section */}
      <PageHero
        heading="Category Management"
        description="Manage product categories across the platform. Organize and structure your product catalog."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-950 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-800 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Categories</h2>
              <p className="text-gray-600 dark:text-gray-300">Total: {filteredCategories.length} categories</p>
            </div>
            <button
              className="btn btn-primary px-4 py-2 rounded-lg font-semibold shadow-sm text-white"
              onClick={() => setAddModalOpen(true)}
            >
              + Add Category
            </button>
          </div>
        </div>
        <div className="mb-8">
          <SearchFilterBar
            searchValue={search}
            onSearchChange={e => setSearch(e.target.value)}
            onSearchSubmit={e => { e.preventDefault(); }}
            filterValue={sortBy}
            filterOptions={sortOptions}
            onFilterChange={val => { if (val) setSortBy(val); }}
            placeholder="Search categories..."
            buttonText="Search"
          />
        </div>
        {message && (
          <div className="alert alert-success mb-6">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{message}</span>
          </div>
        )}
        <div className="bg-white dark:bg-gray-950 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-100 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading categories...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat, idx) => (
                    <tr key={cat.id} className={`transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-950'} border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800`}>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100 font-medium">{cat.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{cat.slug}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="px-3"
                            onClick={() => openEditModal(cat)}
                          >
                            <PencilSquareIcon className="w-4 h-4 mr-1" /> Edit
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            className="px-3"
                            onClick={() => handleDelete(cat.id)}
                          >
                            <TrashIcon className="w-4 h-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Add Category Modal */}
      {addModalOpen && (
        <GenericModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          title="Add Category"
        >
          <form
            className="space-y-6 px-2 sm:px-4"
            onSubmit={e => { e.preventDefault(); handleAdd(); setAddModalOpen(false); }}
          >
            <div className="grid grid-cols-1 gap-4">
              <TextInput
                label="Category Name"
                name="newCat"
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                placeholder="New category name..."
                required
                autoFocus
              />
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                size="md"
                className="w-full sm:w-auto min-w-[120px]"
                onClick={() => setAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="success"
                size="md"
                className="w-full sm:w-auto min-w-[120px]"
                disabled={!newCat.trim()}
              >
                Add
              </Button>
            </div>
          </form>
        </GenericModal>
      )}
      {/* Edit Category Modal */}
      {editModal.open && editModal.cat && (
        <GenericModal
          isOpen={editModal.open}
          onClose={closeEditModal}
          title="Edit Category"
        >
          <form
            className="space-y-6 px-2 sm:px-4"
            onSubmit={e => { e.preventDefault(); saveEdit(); }}
          >
            <div className="grid grid-cols-1 gap-4">
              <TextInput
                label="Category Name"
                name="editName"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Category Name"
                required
                autoFocus
              />
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                size="md"
                className="w-full sm:w-auto min-w-[120px]"
                onClick={closeEditModal}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="success"
                size="md"
                className="w-full sm:w-auto min-w-[120px]"
                disabled={!editName.trim()}
              >
                Save
              </Button>
            </div>
          </form>
        </GenericModal>
      )}
      {/* Delete Confirmation Modal */}
      {confirmAction && confirmAction.type === 'delete' && (
        <ConfirmModal
          isOpen={!!confirmAction}
          title="Confirm Delete"
          description="Are you sure you want to delete this category? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={() => {
            confirmDelete();
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </>
  );
}

(Categories as any).getLayout = (page: React.ReactNode) => <AdminPanelLayout>{page}</AdminPanelLayout>;
