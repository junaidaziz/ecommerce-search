import { useContext, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { AppContext } from '../../contexts/AppContext';
import { Category, CategoryInput, ApiMessage } from '../../types';
import { fetchJson } from '../../lib/utils/fetchJson';
import { TextInput } from '../../components/form-fields';

export default function Categories() {
  const { user } = useContext(AppContext)!;
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCat, setNewCat] = useState<string>('');
  const [newParent, setNewParent] = useState<string>('');
  const [newImage, setNewImage] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [editing, setEditing] = useState<number | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editImage, setEditImage] = useState<string>('');

  const load = useCallback(async () => {
    if (!user) return;
    const data = await fetchJson<Category[]>('/api/admin/categories');
    setCategories(data);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    if (!newCat.trim()) return;
    const payload: CategoryInput = {
      name: newCat,
      parentId: newParent ? Number(newParent) : null,
      image: newImage || undefined,
    };
    await fetchJson<ApiMessage>('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setNewCat('');
    setNewImage('');
    setMessage('Category added');
    load();
  };

  const update = async () => {
    const payload: CategoryInput & { id: number } = {
      id: editing as number,
      name: editName,
      image: editImage || undefined,
    };
    await fetchJson<ApiMessage>('/api/admin/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setEditing(null);
    setEditName('');
    setEditImage('');
    setMessage('Category updated');
    load();
  };

  const remove = async (id: number) => {
    await fetchJson<ApiMessage>(`/api/admin/categories?id=${id}`, {
      method: 'DELETE',
    });
    setMessage('Category deleted');
    load();
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
        <TextInput
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          placeholder="New category"
          className="flex-1"
        />
        <TextInput
          value={newImage}
          onChange={(e) => setNewImage(e.target.value)}
          placeholder="Image URL (optional)"
          className="flex-1"
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

  function buildTree(
    list: Category[]
  ): (Category & { children: Category[] })[] {
    const map: Record<number, Category & { children: Category[] }> =
      {} as Record<number, Category & { children: Category[] }>;
    list.forEach((c) => {
      map[c.id!] = { ...c, children: [] };
    });
    const tree: (Category & { children: Category[] })[] = [];
    list.forEach((c) => {
      if (c.parentId) {
        map[c.parentId]?.children.push(map[c.id!]);
      } else {
        tree.push(map[c.id!]);
      }
    });
    return tree;
  }

  function CategoryItem({ cat }: { cat: Category & { children: Category[] } }) {
    const hasChildren = cat.children && cat.children.length > 0;
    return (
      <li className={cat.parentId ? 'ml-4' : ''}>
        <div className="flex items-center gap-2">
          {editing === cat.id ? (
            <>
              <TextInput
                className="flex-1"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <TextInput
                className="flex-1"
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
                  setEditing(cat.id ?? null);
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
