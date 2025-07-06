import { useContext, useEffect, useState, useCallback } from 'react';
import { AppContext } from '@contexts/AppContext';
import {
  AdminUser,
  UserRoleUpdateRequest,
  UserDisabledUpdateRequest,
  ApiMessage,
  UserRole,
  USER_ROLES,
} from '@/types';
import { fetchJson } from '@utils/fetchJson';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import { ConfirmModal } from '@components/UI';
import Pagination from '@components/Pagination';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function ManageUsers() {
  const { user } = useContext(AppContext)!;
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [message, setMessage] = useState<string>('');
  const [deleteUser, setDeleteUser] = useState<{
    id: number;
    email: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [confirmAction, setConfirmAction] = useState<null | { type: 'delete' | 'edit', payload: any }>(null);
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    user: AdminUser | null;
    role: string;
    disabled: boolean;
  }>({
    isOpen: false,
    user: null,
    role: '',
    disabled: false,
  });

  const fetchUsers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (sortBy) params.set('sort', sortBy);
      
      const data = await fetchJson<{ users: AdminUser[]; total: number; page: number; limit: number }>(`/api/admin/users?${params.toString()}`);
      setUsers(data.users);
      setTotal(data.total);
    } catch (error) {
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [user, search, page, limit, sortBy]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEdit = (user: AdminUser) => {
    setEditModal({
      isOpen: true,
      user,
      role: user.role.toLowerCase(),
      disabled: user.disabled,
    });
  };

  const handleDelete = (id: number, email: string) => setConfirmAction({ type: 'delete', payload: { id, email } });

  const updateUser = async () => {
    if (!editModal.user) return;
    
    try {
      // Update role if changed
      if (editModal.role !== editModal.user.role.toLowerCase()) {
        await fetchJson<ApiMessage>(`/api/admin/users/${encodeURIComponent(editModal.user.email)}/role`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: editModal.role.toUpperCase() }),
        });
      }

      // Update disabled status if changed
      if (editModal.disabled !== editModal.user.disabled) {
        await fetchJson<ApiMessage>(`/api/admin/users/${encodeURIComponent(editModal.user.email)}/disable`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ disabled: editModal.disabled }),
        });
      }

      setMessage('User updated successfully');
      setEditModal({ isOpen: false, user: null, role: '', disabled: false });
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      setMessage('Failed to update user');
    }
  };

  const confirmDelete = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    try {
      await fetchJson<ApiMessage>(`/api/admin/users/${encodeURIComponent(deleteUser.email)}`, {
        method: 'DELETE',
      });
      setMessage('User deleted successfully');
      setDeleteUser(null);
      fetchUsers();
    } catch (error) {
      setMessage('Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleSearch = (e: React.FormEvent) => { 
    e.preventDefault(); 
    setPage(1); 
    fetchUsers(); 
  };

  const totalPages = Math.ceil(total / limit);

  if (!user) return <div className="p-4">Please log in to view users.</div>;
  if (user.role.toUpperCase() !== USER_ROLES.SUPER_ADMIN)
    return <div className="p-4">Admin access required.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Head>
        <title>{getPageTitle('Manage Users')}</title>
      </Head>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-blue-600 to-green-800">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">User Management</h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">Manage all users across the platform. View, edit roles, and maintain user accounts.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All Users</h2>
              <p className="text-gray-600">Total: {total} users</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <form onSubmit={handleSearch}>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Search users..." 
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
              <option value="email_asc">Email A-Z</option>
              <option value="email_desc">Email Z-A</option>
              <option value="role_asc">Role A-Z</option>
              <option value="role_desc">Role Z-A</option>
            </select>
          </div>
          <div className="bg-white rounded-xl shadow border border-gray-100 overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-6 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-6 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors duration-150 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <div className="h-9 w-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-base shadow-md border-2 border-white">
                              {u.email?.[0]?.toUpperCase() || '?'}
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 leading-tight">{u.email}</div>
                            <div className="text-xs text-gray-400 font-mono">ID: {u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide 
                          ${u.role === 'SUPER_ADMIN' ? 'bg-blue-100 text-blue-700' : 
                            u.role === 'BRAND' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide 
                          ${u.disabled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                        >
                          {u.disabled ? 'Inactive' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(u)}
                            disabled={u.role === 'SUPER_ADMIN'}
                            className="flex items-center gap-1 btn btn-sm bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:text-blue-900 font-semibold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(u.id, u.email)}
                            disabled={u.role === 'SUPER_ADMIN'}
                            className="flex items-center gap-1 btn btn-sm bg-red-500 text-white hover:bg-red-600 font-semibold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
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
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            </div>
          )}
        </div>

        {message && (
          <div className="alert alert-success mb-6">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{message}</span>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editModal.isOpen && editModal.user && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md bg-base-100 shadow-xl rounded-xl p-6">
            <h3 className="font-bold text-2xl mb-1">Edit User: <span className="text-primary">{editModal.user.email}</span></h3>
            <p className="text-gray-500 mb-4">Update the user&apos;s role and active status below.</p>
            <div className="border-b border-gray-200 mb-4"></div>
            <div className="space-y-6">
              <div>
                <label className="label mb-1">
                  <span className="label-text font-semibold">Role</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={editModal.role}
                  onChange={(e) => setEditModal(prev => ({ ...prev, role: e.target.value }))}
                  disabled={editModal.user.role === 'SUPER_ADMIN'}
                >
                  <option value="user">User</option>
                  <option value="brand">Brand</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="label mb-1 flex items-center justify-between cursor-pointer">
                  <span className="label-text font-semibold">Active</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-success"
                    checked={!editModal.disabled}
                    onChange={(e) => setEditModal(prev => ({ ...prev, disabled: !e.target.checked }))}
                    disabled={editModal.user.role === 'SUPER_ADMIN'}
                  />
                </label>
              </div>
            </div>
            <div className="modal-action mt-8 flex gap-2">
              <button
                className="btn btn-outline flex-1"
                onClick={() => setEditModal({ isOpen: false, user: null, role: '', disabled: false })}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary text-white flex-1"
                onClick={updateUser}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmAction && confirmAction.type === 'delete' && (
        <ConfirmModal
          isOpen={!!confirmAction}
          title="Confirm Delete"
          description={`Are you sure you want to delete user ${confirmAction.payload.email}? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={() => {
            confirmDelete();
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
