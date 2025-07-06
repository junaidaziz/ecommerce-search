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
        <Hero />
        <FeaturedCards />
        <CategoryGrid categories={categories.slice(0, 6)} />
      </main>
    </div>
  );
};

export default HomePage;
