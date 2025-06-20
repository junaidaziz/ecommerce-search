import { useContext, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { AppContext } from '../../contexts/AppContext';

export default function Categories() {
  const { user } = useContext(AppContext)!;
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState('');
  const [newParent, setNewParent] = useState('');
  const [newImage, setNewImage] = useState('');
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    const res = await fetch('/api/admin/categories');
    if (res.ok) setCategories(await res.json());
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    if (!newCat.trim()) return;
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCat, parentId: newParent || null, image: newImage || null }),
    });
    if (res.ok) {
      setNewCat('');
      setNewImage('');
      setMessage('Category added');
      load();
    }
  };

  const update = async () => {
    const res = await fetch('/api/admin/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editing, name: editName, image: editImage || null }),
    });
    if (res.ok) {
      setEditing(null);
      setEditName('');
      setEditImage('');
      setMessage('Category updated');
      load();
    }
  };

  const remove = async (id) => {
    const res = await fetch(`/api/admin/categories?id=${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setMessage('Category deleted');
      load();
    }
  };

  if (!user)
    return <div className="p-4">Please log in to view categories.</div>;
  if (user.role !== 'super-admin')
    return <div className="p-4">Admin access required.</div>;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      {message && <div className="mb-4 text-green-600">{message}</div>}
      <div className="flex gap-2 mb-4">
        <input
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          placeholder="New category"
          className="input input-bordered flex-1"
        />
        <input
          value={newImage}
          onChange={(e) => setNewImage(e.target.value)}
          placeholder="Image URL (optional)"
          className="input input-bordered flex-1"
        />
        <select
          className="select select-bordered"
          value={newParent}
          onChange={(e) => setNewParent(e.target.value)}
        >
          <option value="">No parent</option>
          {categories
            .filter((c) => !c.parentId)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
        <button onClick={add} className="btn btn-primary">
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {buildTree(categories).map((c) => (
          <CategoryItem key={c.id} cat={c} />
        ))}
      </ul>
    </div>
  );

  function buildTree(list) {
    const map = {};
    list.forEach((c) => {
      map[c.id] = { ...c, children: [] };
    });
    const tree = [];
    list.forEach((c) => {
      if (c.parentId) {
        map[c.parentId]?.children.push(map[c.id]);
      } else {
        tree.push(map[c.id]);
      }
    });
    return tree;
  }

  function CategoryItem({ cat }) {
    const hasChildren = cat.children && cat.children.length > 0;
    return (
      <li className={cat.parentId ? 'ml-4' : ''}>
        <div className="flex items-center gap-2">
          {editing === cat.id ? (
            <>
              <input
                className="input input-bordered flex-1"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <input
                className="input input-bordered flex-1"
                value={editImage}
                onChange={(e) => setEditImage(e.target.value)}
                placeholder="Image URL (optional)"
              />
              <button onClick={update} className="btn btn-sm">
                Save
              </button>
              <button onClick={() => setEditing(null)} className="btn btn-sm">
                Cancel
              </button>
            </>
          ) : (
            <>
              <span className="flex-1 flex items-center gap-2">
                {cat.image && (
                  <Image
                    src={cat.image}
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6 object-cover"
                  />
                )}
                {cat.name}
              </span>
              <button
                onClick={() => {
                  setEditing(cat.id);
                  setEditName(cat.name);
                  setEditImage(cat.image || '');
                }}
                className="btn btn-sm"
              >
                Edit
              </button>
              <button onClick={() => remove(cat.id)} className="btn btn-sm">
                Delete
              </button>
            </>
          )}
        </div>
        {hasChildren && (
          <ul className="ml-4 space-y-2">
            {cat.children.map((child) => (
              <CategoryItem key={child.id} cat={child} />
            ))}
          </ul>
        )}
      </li>
    );
  }
}
