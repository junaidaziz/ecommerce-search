import { useContext, useEffect, useState, useCallback } from 'react';
import { AppContext } from '@contexts/AppContext';
import {
  AdminUser,
  ApiMessage,
  USER_ROLES,
} from '@/types';
import { fetchJson } from '@utils/fetchJson';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import Pagination from '@components/Pagination';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import AdminPanelLayout from '@components/Layout/AdminPanelLayout';
import SearchFilterBar from '@components/common/SearchFilterBar';
import GenericModal from '@components/Modals/GenericModal';
import ConfirmModal from '@components/Modals/ConfirmModal';
import { Button } from '@components/UI/Button';
import TextInput from '@components/form-fields/TextInput';
import PasswordInput from '@components/form-fields/PasswordInput';
import PageHero from '@components/UI/PageHero';

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
  const [confirmAction, setConfirmAction] = useState<null | { type: 'delete' | 'edit', payload: AdminUser }>(null);
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
  // Add state for Add Super Admin modal
  const [addSuperAdminModal, setAddSuperAdminModal] = useState(false);
  const [newSuperAdmin, setNewSuperAdmin] = useState({ email: '', password: '', loading: false, error: '', success: '' });

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
  }, [user, page, search, sortBy, fetchUsers]);

  // Add this useEffect to reset page to 1 when sortBy changes
  useEffect(() => {
    setPage(1);
  }, [sortBy]);

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

  const sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Email A-Z', value: 'email_asc' },
    { label: 'Email Z-A', value: 'email_desc' },
    { label: 'Role A-Z', value: 'role_asc' },
    { label: 'Role Z-A', value: 'role_desc' },
  ];

  return (
    <>
      <Head>
        <title>{getPageTitle('Manage Users')}</title>
      </Head>
      {/* Hero Section */}
      <PageHero
        heading="User Management"
        description="Manage all users across the platform. View, edit roles, and maintain user accounts."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-950 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-800 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Users</h2>
              <p className="text-gray-600 dark:text-gray-300">Total: {total} users</p>
            </div>
            <button
              className="btn btn-primary px-4 py-2 rounded-lg font-semibold shadow-sm text-white"
              onClick={() => setAddSuperAdminModal(true)}
            >
              + Add Super Admin
            </button>
          </div>
        </div>
        <div className="mb-8">
          <SearchFilterBar
            searchValue={search}
            onSearchChange={e => setSearch(e.target.value)}
            onSearchSubmit={handleSearch}
            filterValue={sortOptions.find(opt => opt.value === sortBy) || sortOptions[0]}
            filterOptions={sortOptions}
            onFilterChange={val => { if (val) setSortBy(val.value); }}
            placeholder="Search users..."
            buttonText="Search"
          />
        </div>
        {message && (<div className="alert alert-success mb-6"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg><span>{message}</span></div>)}
        <div className="bg-white dark:bg-gray-950 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-100 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400 dark:text-gray-500">No users found.</td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id} className={`transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-950'} border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800`}>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.email}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                        user.role === USER_ROLES.SUPER_ADMIN 
                          ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                          : user.role === USER_ROLES.SUPER_ADMIN
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : user.role === USER_ROLES.BRAND
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                      }`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                        user.disabled
                          ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                          : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      }`}>
                        {user.disabled ? 'Disabled' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="flex items-center gap-1 btn btn-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-800 font-semibold rounded-lg shadow-sm transition px-3 py-1.5"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.email)}
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
        {totalPages > 1 && (<div className="mt-8 flex justify-center"><Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} /></div>)}
      </div>

      {/* Edit User Modal */}
      {editModal.isOpen && editModal.user && (
        <GenericModal
          isOpen={editModal.isOpen}
          onClose={() => setEditModal({ isOpen: false, user: null, role: '', disabled: false })}
          title={`Edit User`}
        >
          <div className="space-y-6 px-2 sm:px-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Email</label>
                <input
                  type="text"
                  value={editModal.user.email}
                  readOnly
                  className="input input-bordered w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-700 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Role</label>
                <select
                  className="select select-bordered w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                  value={editModal.role}
                  onChange={(e) => setEditModal(prev => ({ ...prev, role: e.target.value }))}
                  disabled={editModal.user.role === 'SUPER_ADMIN'}
                >
                  <option value="user">User</option>
                  <option value="brand">Brand</option>
                </select>
              </div>
              <div>
                <label className="flex items-center justify-between cursor-pointer font-semibold mb-1 text-gray-700 dark:text-gray-200">
                  <span>Active</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-success"
                    checked={!editModal.disabled}
                    onChange={(e) => setEditModal(prev => ({ ...prev, disabled: !e.target.checked }))}
                    disabled={editModal.user.role === USER_ROLES.SUPER_ADMIN}
                  />
                </label>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                size="md"
                rounded={false}
                className="w-full sm:w-auto min-w-[120px]"
                onClick={() => setEditModal({ isOpen: false, user: null, role: '', disabled: false })}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="success"
                size="md"
                rounded={false}
                className="w-full sm:w-auto min-w-[120px]"
                onClick={updateUser}
              >
                Update
              </Button>
            </div>
          </div>
        </GenericModal>
      )}

      {/* Add Super Admin Modal */}
      {addSuperAdminModal && (
        <GenericModal
          isOpen={addSuperAdminModal}
          onClose={() => setAddSuperAdminModal(false)}
          title="Add Super Admin"
        >
          <form
            className="space-y-6 px-2 sm:px-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setNewSuperAdmin((s) => ({ ...s, loading: true, error: '', success: '' }));
              try {
                const res = await fetch('/api/admin/users', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: newSuperAdmin.email, password: newSuperAdmin.password, role: USER_ROLES.SUPER_ADMIN }),
                });
                if (!res.ok) throw new Error((await res.json()).message || 'Failed to add super admin');
                setNewSuperAdmin({ email: '', password: '', loading: false, error: '', success: 'Super admin added!' });
                fetchUsers();
              } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to add super admin';
                setNewSuperAdmin((s) => ({ ...s, loading: false, error: errorMessage, success: '' }));
              }
            }}
          >
            <div className="grid grid-cols-1 gap-4">
              <TextInput
                label="Email"
                name="email"
                type="email"
                value={newSuperAdmin.email}
                onChange={e => setNewSuperAdmin(s => ({ ...s, email: e.target.value }))}
                required
                autoFocus
                autoComplete="username"
              />
              <PasswordInput
                label="Password"
                name="password"
                value={newSuperAdmin.password}
                onChange={e => setNewSuperAdmin(s => ({ ...s, password: e.target.value }))}
                required
                autoComplete="new-password"
              />
            </div>
            {(newSuperAdmin.error || newSuperAdmin.success) && (
              <div className="text-sm font-medium mb-2">
                {newSuperAdmin.error && <span className="text-red-500">{newSuperAdmin.error}</span>}
                {newSuperAdmin.success && <span className="text-green-500">{newSuperAdmin.success}</span>}
              </div>
            )}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                size="md"
                rounded={false}
                className="w-full sm:w-auto min-w-[120px]"
                onClick={() => setAddSuperAdminModal(false)}
                disabled={newSuperAdmin.loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="success"
                size="md"
                rounded={false}
                className="w-full sm:w-auto min-w-[120px]"
                disabled={newSuperAdmin.loading}
              >
                {newSuperAdmin.loading ? 'Adding...' : 'Add Super Admin'}
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
          email={confirmAction.payload.email}
          name={confirmAction.payload.name}
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

ManageUsers.getLayout = (page: React.ReactNode) => <AdminPanelLayout>{page}</AdminPanelLayout>;
