import { apiFetch } from '@lib/api';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { getPageTitle } from '@lib/pageTitle';
import DEFAULT_CATEGORIES from '@lib/defaultCategories';
import CATEGORY_IMAGES from '@lib/categoryImages';
import {
  FeaturedCards, 
  CategoryGrid,
  Hero
} from '@lib/dynamicImports';
import type { CategoryItem } from '@components/Category/CategorySlider';

const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    apiFetch('/api/categories')
      .then((res) => (res.ok ? res.json() : { categories: DEFAULT_CATEGORIES }))
      .then((data: { categories: { name: string; slug?: string }[] } | any) => {
        const list = Array.isArray(data) ? data : data.categories;
        const mapped = (list || DEFAULT_CATEGORIES).map((c: any) => ({
          name: c.name,
          slug: c.slug,
          image: CATEGORY_IMAGES[c.name],
        }));
        setCategories(mapped);
      })
      .catch(() => {
        setCategories(
          DEFAULT_CATEGORIES.map((c) => ({
            name: c.name,
            slug: c.slug,
            image: CATEGORY_IMAGES[c.name],
          }))
        );
      });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{getPageTitle('Home')}</title>
      </Head>
      <main className="flex-1">
        {/* Hero Section - full width, visually impactful */}
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 pt-8 md:pt-12 pb-8 md:pb-16">
          <Hero />
        </div>

        {/* Featured Products Section */}
        <section className="w-full max-w-7xl mx-auto px-2 sm:px-6 py-8 md:py-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white text-center mb-2">Featured Products</h2>
          <p className="text-lg text-gray-500 dark:text-gray-300 text-center mb-8">Discover our best sellers and latest arrivals, handpicked for you.</p>
          <FeaturedCards />
        </section>

        {/* Categories Section */}
        <section className="w-full max-w-7xl mx-auto px-2 sm:px-6 py-8 md:py-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white text-center mb-2">Browse Categories</h2>
          <p className="text-lg text-gray-500 dark:text-gray-300 text-center mb-8">Find exactly what you need…</p>
          <CategoryGrid categories={categories.slice(0, 6)} />
        </section>
      </main>
    </div>
  );
};

export default HomePage;
