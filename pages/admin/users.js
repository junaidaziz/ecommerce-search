import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';

export default function ManageUsers() {
  const { user } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    if (!user) return;
    const res = await fetch('/api/admin/users');
    if (res.ok) setUsers(await res.json());
  };

  useEffect(() => { fetchUsers(); }, [user]);

  const changeRole = async (email, role) => {
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role })
    });
    if (res.ok) {
      setMessage('Role updated');
      fetchUsers();
    }
  };

  const remove = async email => {
    const res = await fetch(`/api/admin/users?email=${encodeURIComponent(email)}`, { method: 'DELETE' });
    if (res.ok) {
      setMessage('User deleted');
      fetchUsers();
    }
  };

  if (!user) return <div className="p-4">Please log in to view users.</div>;
  if (user.role !== 'admin') return <div className="p-4">Admin access required.</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
      {message && <div className="mb-4 text-green-600">{message}</div>}
      <ul className="space-y-2">
        {users.map(u => (
          <li key={u.email} className="flex items-center gap-2">
            <span className="flex-1">{u.email}</span>
            <select
              className="select select-bordered"
              value={u.role}
              onChange={e => changeRole(u.email, e.target.value)}
            >
              <option value="user">user</option>
              <option value="vendor">vendor</option>
              <option value="admin">admin</option>
            </select>
            <button onClick={() => remove(u.email)} className="btn btn-sm">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
