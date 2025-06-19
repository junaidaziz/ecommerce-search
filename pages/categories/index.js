import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    fetch('/api/category-tree')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCategories(data));
  }, []);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <ul className="list-disc pl-4 space-y-1">
        {categories.map((c) => (
          <li key={c.name}>
            <Link href={`/categories/${encodeURIComponent(c.name)}`}>{c.name}</Link>
          </li>
        ))}
        {categories.length === 0 && <li>No categories found.</li>}
      </ul>
    </div>
  );
}
