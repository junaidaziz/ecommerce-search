import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';

export default function Categories() {
  const { user } = useContext(AppContext);
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState('');
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');

  const load = async () => {
    if (!user) return;
    const res = await fetch('/api/admin/categories');
    if (res.ok) setCategories(await res.json());
  };

  useEffect(() => { load(); }, [user]);

  const add = async () => {
    if (!newCat.trim()) return;
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCat })
    });
    if (res.ok) {
      setNewCat('');
      setMessage('Category added');
      load();
    }
  };

  const update = async () => {
    const res = await fetch('/api/admin/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editing, name: editName })
    });
    if (res.ok) {
      setEditing(null);
      setEditName('');
      setMessage('Category updated');
      load();
    }
  };

  const remove = async id => {
    const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMessage('Category deleted');
      load();
    }
  };

  if (!user) return <div className="p-4">Please log in to view categories.</div>;
  if (user.role !== 'admin') return <div className="p-4">Admin access required.</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      {message && <div className="mb-4 text-green-600">{message}</div>}
      <div className="flex gap-2 mb-4">
        <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="New category" className="input input-bordered flex-1" />
        <button onClick={add} className="btn btn-primary">Add</button>
      </div>
      <ul className="space-y-2">
        {categories.map(c => (
          <li key={c.id} className="flex items-center gap-2">
            {editing === c.id ? (
              <>
                <input className="input input-bordered flex-1" value={editName} onChange={e => setEditName(e.target.value)} />
                <button onClick={update} className="btn btn-sm">Save</button>
                <button onClick={() => setEditing(null)} className="btn btn-sm">Cancel</button>
              </>
            ) : (
              <>
                <span className="flex-1">{c.name}</span>
                <button onClick={() => { setEditing(c.id); setEditName(c.name); }} className="btn btn-sm">Edit</button>
                <button onClick={() => remove(c.id)} className="btn btn-sm">Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
