import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '../../types';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Category[]) => setCategories(data));
  }, []);

  const renderCat = (cat: Category): React.ReactNode => (
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

  return (
    <div className="max-w-2xl mx-auto min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <ul className="list-disc pl-4 space-y-2">
        {categories.map((c) => (
          <li key={c.name} className="flex items-center gap-2">
            {c.image && (
              <Image
                src={c.image}
                alt={c.name}
                width={32}
                height={32}
                className="w-8 h-8 object-cover"
              />
            )}
            <Link href={`/categories/${encodeURIComponent(c.name)}`}>{c.name}</Link>
          </li>
        ))}
        {categories.length === 0 && <li>No categories found.</li>}
      </ul>
    </div>
  );
};

export default Categories;
