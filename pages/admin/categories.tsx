import { useContext, useEffect, useState, useCallback } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { Category, CategoryInput, ApiMessage } from '../../types';
import { fetchJson } from '../../lib/utils/fetchJson';
import { TextInput } from '../../components/form-fields';
import Head from 'next/head';
import { getPageTitle } from '../../lib/pageTitle';

export default function Categories() {
  const { user } = useContext(AppContext)!;
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCat, setNewCat] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');

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
    };
    await fetchJson<ApiMessage>('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setNewCat('');
    setMessage('Category added');
    load();
  };

  const update = async () => {
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
      <Head>
        <title>{getPageTitle('Manage Categories')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      {message && <div className="mb-4 text-green-600">{message}</div>}
      <div className="flex gap-2 mb-4">
        <TextInput
          label=""
          name="new-category"
          value={newCat}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewCat(e.target.value)
          }
          onBlur={() => {}}
          error={undefined}
          placeholder="New category"
          className="flex-1"
          leftAddon={undefined}
          rightAddon={undefined}
          register={undefined}
          rules={undefined}
        />
        <button onClick={add} className="btn btn-primary">
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {categories.map((c) => (
          <CategoryItem key={c.id} cat={c} />
        ))}
      </ul>
    </div>
  );

  function CategoryItem({ cat }: { cat: Category }) {
    return (
      <li>
        <div className="flex items-center gap-2">
          {editing === cat.id ? (
            <>
              <TextInput
                className="flex-1"
                label=""
                name="edit-category"
                placeholder="Edit category"
                value={editName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditName(e.target.value)
                }
                onBlur={() => {}}
                error={undefined}
                leftAddon={undefined}
                rightAddon={undefined}
                register={undefined}
                rules={undefined}
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
              <span className="flex-1">{cat.name}</span>
              <button
                onClick={() => {
                  setEditing(cat.uuid ?? null);
                  setEditName(cat.name);
                }}
                className="btn btn-sm"
              >
                Edit
              </button>
              <button
                onClick={() => remove(Number(cat.id))}
                className="btn btn-sm"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </li>
    );
  }
}
