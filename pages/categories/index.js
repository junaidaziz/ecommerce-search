import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCategories(data));
  }, []);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <ul className="list-disc pl-4 space-y-2">
        {categories.map((c) => (
          <li key={c.name} className="flex items-center gap-2">
            {c.image && (
              <img src={c.image} alt="" className="w-8 h-8 object-cover" />
            )}
            <Link href={`/categories/${encodeURIComponent(c.name)}`}>{c.name}</Link>
          </li>
        ))}
        {categories.length === 0 && <li>No categories found.</li>}
      </ul>
    </div>
  );

  function renderCat(cat) {
    return (
      <li key={cat.id} className={cat.parentId ? 'ml-4 list-disc' : ''}>
        <Link href={`/categories/${encodeURIComponent(cat.name)}`}>
          {cat.name}
        </Link>
        {cat.children && cat.children.length > 0 && (
          <ul className="ml-4 space-y-1 list-disc">
            {cat.children.map((child) => renderCat(child))}
          </ul>
        )}
      </li>
    );
  }
}
