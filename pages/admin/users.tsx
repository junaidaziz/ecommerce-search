import { useContext, useEffect, useState, useCallback } from 'react';
import { AppContext } from '../../contexts/AppContext';
import type { UsersResponse } from '../../types/api';
import type { User } from '../../types/user';

export default function ManageUsers() {
  const { user } = useContext(AppContext)!;
  const [users, setUsers] = useState<(User & { disabled?: boolean })[]>([]);
  const [message, setMessage] = useState('');

  const fetchUsers = useCallback(async () => {
    if (!user) return;
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      const data: UsersResponse = await res.json();
      setUsers(data.users || data);
    }
  }, [user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const changeRole = async (email: string, role: string) => {
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    });
    if (res.ok) {
      setMessage('Role updated');
      fetchUsers();
    }
  };

  const toggleDisabled = async (email: string, disabled: boolean) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, disabled }),
    });
    if (res.ok) {
      setMessage('Status updated');
      fetchUsers();
    }
  };

  const remove = async (email: string) => {
    const res = await fetch(
      `/api/admin/users?email=${encodeURIComponent(email)}`,
      { method: 'DELETE' }
    );
    if (res.ok) {
      setMessage('User deleted');
      fetchUsers();
    }
  };

  if (!user) return <div className="p-4">Please log in to view users.</div>;
  if (user.role !== 'super-admin')
    return <div className="p-4">Admin access required.</div>;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
      {message && <div className="mb-4 text-green-600">{message}</div>}
      <ul className="space-y-2">
        {users.map((u) => (
          <li key={u.email} className="flex items-center gap-2">
            <span className="flex-1">{u.email}</span>
            <select
              className="select select-bordered"
              value={u.role}
              onChange={(e) => changeRole(u.email, e.target.value)}
            >
              <option value="user">user</option>
              <option value="brand">brand</option>
              <option value="super-admin">super-admin</option>
            </select>
            <label className="label cursor-pointer gap-1">
              <span className="label-text">Disabled</span>
              <input
                type="checkbox"
                className="checkbox"
                checked={u.disabled}
                onChange={(e) => toggleDisabled(u.email, e.target.checked)}
              />
            </label>
            <button onClick={() => remove(u.email)} className="btn btn-sm">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
