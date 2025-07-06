import { useContext, useEffect, useState, useCallback } from 'react';
import { AppContext } from '@contexts/AppContext';
import { Category, CategoryInput, ApiMessage, UserRole, USER_ROLES } from '@/types';
import { fetchJson } from '@utils/fetchJson';
import { TextInput } from '@components/form-fields';
import { slugify } from '@lib/slugify';
import { ConfirmModal } from '@components/UI';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';

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
  const handleEdit = (cat) => setConfirmAction({ type: 'edit', payload: cat });
  const handleDelete = (id) => setConfirmAction({ type: 'delete', payload: id });

  const add = async () => {
    if (!newCat.trim()) return;
    try {
      const payload: CategoryInput = {
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
      const payload: CategoryInput & { uuid: string } = {
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

  if (!user)
    return <div className="p-4">Please log in to view categories.</div>;
  if (user.role.toUpperCase() !== USER_ROLES.SUPER_ADMIN)
    return <div className="p-4">Admin access required.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Head>
        <title>{getPageTitle('Manage Categories')}</title>
      </Head>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Category Management</h1>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">Manage product categories across the platform. Organize and structure your product catalog.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All Categories</h2>
              <p className="text-gray-600">Total: {categories.length} categories</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New category name..."
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                className="input input-bordered flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              />
              <button 
                onClick={handleAdd} 
                className="btn btn-primary text-white"
                disabled={!newCat.trim()}
              >
                Add Category
              </button>
            </div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading categories...</span>
                      </div>
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                              {cat.name?.[0]?.toUpperCase() || 'C'}
                            </div>
                          </div>
                          <div className="ml-4">
                            {editing === cat.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="input input-bordered input-sm"
                                  onKeyPress={(e) => e.key === 'Enter' && update()}
                                />
                                <button 
                                  onClick={() => handleEdit(cat)} 
                                  className="btn btn-primary text-white"
                                  disabled={!editName.trim()}
                                >
                                  Save
                                </button>
                                <button 
                                  onClick={() => setEditing(null)} 
                                  className="btn btn-secondary text-white"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="text-sm font-medium text-gray-900">{cat.name}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cat.slug || slugify(cat.name)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {editing !== cat.id && (
                            <>
                              <button
                                onClick={() => handleEdit(cat)}
                                className="btn btn-primary text-white"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(cat.id)}
                                className="btn btn-error text-white"
                              >
                                Delete
                              </button>
                            </>
                          )}
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

      {confirmAction && (
        <ConfirmModal
          isOpen={!!confirmAction}
          title={`Confirm ${confirmAction.type.charAt(0).toUpperCase() + confirmAction.type.slice(1)}`}
          description={`Are you sure you want to ${confirmAction.type} this category?`}
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          onConfirm={() => {
            if (confirmAction.type === 'add') {
              add();
            } else if (confirmAction.type === 'edit') {
              update();
            } else if (confirmAction.type === 'delete') {
              confirmDelete();
            }
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
