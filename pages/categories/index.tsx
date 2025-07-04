import { apiFetch } from '@lib/api';
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import CategoryCard from '@components/Category/CategoryCard';
import { getPageTitle } from '@lib/pageTitle';
import { Category } from '@/types';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    apiFetch('/api/categories')
      .then((res) => (res.ok ? res.json() : { categories: [] }))
      .then((data: { categories: Category[] }) =>
        setCategories(data.categories)
      );
  }, []);

  const renderCat = (cat: Category): React.ReactNode => (
    <CategoryCard key={cat.id ?? cat.name} category={cat} />
  );

  return (
    <div className="max-w-screen-lg mx-auto min-h-screen p-4">
      <Head>
        <title>{getPageTitle('Categories')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      {categories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {categories.map((c) => renderCat(c))}
        </div>
      )}
    </div>
  );
};

export default Categories;
