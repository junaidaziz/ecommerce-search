import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { getPageTitle } from '../../lib/pageTitle';
import { Category } from '../../types';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : { categories: [] }))
      .then((data: { categories: Category[] }) => setCategories(data.categories));
  }, []);

  const renderCat = (cat: Category): React.ReactNode => (
    <li key={cat.id}>
      <Link href={`/categories/${encodeURIComponent(cat.name)}`}>{cat.name}</Link>
    </li>
  );

  return (
    <div className="max-w-2xl mx-auto min-h-screen p-4">
      <Head>
        <title>{getPageTitle('Categories')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <ul className="list-disc pl-4 space-y-2">
        {categories.map((c) => renderCat(c))}
        {categories.length === 0 && <li>No categories found.</li>}
      </ul>
    </div>
  );
};

export default Categories;
