import { useContext, useEffect, useState, useCallback } from 'react';
import { AppContext } from '@contexts/AppContext';
import {
  AdminUser,
  UserRoleUpdateRequest,
  UserDisabledUpdateRequest,
  ApiMessage,
  UserRole,
} from '@/types';
import { fetchJson } from '@utils/fetchJson';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import { ConfirmModal } from '@components/UI';

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

  const fetchUsers = useCallback(async () => {
    if (!user) return;
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const data = await fetchJson<AdminUser[]>(`/api/admin/users?${params.toString()}`);
    setUsers(data);
  }, [user, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const changeRole = async (email: string, role: string) => {
    await fetchJson<ApiMessage>(`/api/admin/users/${encodeURIComponent(email)}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    setMessage('Role updated');
    fetchUsers();
  };

  const toggleDisabled = async (email: string, disabled: boolean) => {
    await fetchJson<ApiMessage>(`/api/admin/users/${encodeURIComponent(email)}/disable`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disabled }),
    });
    setMessage('Status updated');
    fetchUsers();
  };

  const handleDelete = (id: number, email: string) => {
    setDeleteUser({ id, email });
  };

  const confirmDelete = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    await fetchJson<ApiMessage>(`/api/admin/users/${encodeURIComponent(deleteUser.email)}`, {
      method: 'DELETE',
    });
    setDeleting(false);
    setMessage('User deleted');
    setDeleteUser(null);
    fetchUsers();
  };

  if (!user) return <div className="p-4">Please log in to view users.</div>;
  if (user.role.toUpperCase() !== UserRole.SUPER_ADMIN)
    return <div className="p-4">Admin access required.</div>;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <Head>
        <title>{getPageTitle('Manage Users')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
      <input
        type="text"
        placeholder="Search"
        className="input input-bordered mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {message && <div className="mb-4 text-green-600">{message}</div>}
      <ul className="space-y-2">
        {users.map((u) => (
          <li key={u.id} className="flex items-center gap-2">
            <span className="flex-1">
              {u.email}
              {u.role === 'SUPER_ADMIN' && (
                <span className="ml-2 badge badge-secondary">Super Admin</span>
              )}
            </span>
            <select
              className="select select-bordered"
              value={u.role.toLowerCase()}
              onChange={(e) => changeRole(u.email, e.target.value)}
              disabled={u.role === 'SUPER_ADMIN'}
            >
              <option value="user">user</option>
              <option value="brand">brand</option>
              <option
                value={UserRole.SUPER_ADMIN.toLowerCase().replace('_', '-')}
              >
                {UserRole.SUPER_ADMIN.toLowerCase().replace('_', '-')}
              </option>
            </select>
            <label className="label cursor-pointer gap-1">
              <span className="label-text">Disabled</span>
              <input
                type="checkbox"
                className="checkbox"
                checked={u.disabled}
                onChange={(e) => toggleDisabled(u.email, e.target.checked)}
                disabled={u.role === 'SUPER_ADMIN'}
              />
            </label>
            <button
              onClick={() => handleDelete(u.id, u.email)}
              className="btn btn-sm"
              disabled={u.role === 'SUPER_ADMIN'}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <ConfirmModal
        isOpen={!!deleteUser}
        title="Are you sure?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteUser(null)}
      />
    </div>
  );
}
