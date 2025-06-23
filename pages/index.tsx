import Head from 'next/head';
import { useEffect, useState } from 'react';
import HomeHero from '../components/HomeHero';
import FeaturedProducts from '../components/FeaturedProducts';
import CategoryPromotion from '../components/CategoryPromotion';
import CategorySlider, { CategoryItem } from '../components/CategorySlider';
import { getPageTitle } from '../lib/pageTitle';
import DEFAULT_CATEGORIES from '../lib/defaultCategories';

const categoryImages: Record<string, string> = {
  Electronics:
    'https://images.unsplash.com/photo-1510557880182-3b5af3a1fb0b?auto=format&fit=crop&w=400&q=80',
  Fashion:
    'https://images.unsplash.com/photo-1521335629791-ce4aec67dd52?auto=format&fit=crop&w=400&q=80',
  Home:
    'https://images.unsplash.com/photo-1505692794403-44a6e5478626?auto=format&fit=crop&w=400&q=80',
  Toys:
    'https://images.unsplash.com/photo-1608837010774-e0e6759e9721?auto=format&fit=crop&w=400&q=80',
  Sports:
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
};

const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : { categories: DEFAULT_CATEGORIES }))
      .then((data: { categories: { name: string; slug?: string }[] } | any) => {
        const list = Array.isArray(data) ? data : data.categories;
        const mapped = (list || DEFAULT_CATEGORIES).map((c: any) => ({
          name: c.name,
          slug: c.slug,
          image: categoryImages[c.name],
        }));
        setCategories(mapped);
      })
      .catch(() => {
        setCategories(
          DEFAULT_CATEGORIES.map((c) => ({
            name: c.name,
            slug: c.slug,
            image: categoryImages[c.name],
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
        <HomeHero />
        <FeaturedProducts />
        <CategoryPromotion categories={categories} />
      </main>
    </div>
  );
};

export default HomePage;
