import Head from 'next/head';
import { useEffect, useState } from 'react';
import HomeHero from '../components/HomeHero';
import FeaturedProducts from '../components/Product/FeaturedProducts';
import CategoryPromotion from '../components/Category/CategoryPromotion';
import PromoBanner from '../components/PromoBanner';
import CategorySlider, { CategoryItem } from '../components/Category/CategorySlider';
import { getPageTitle } from '../lib/pageTitle';
import DEFAULT_CATEGORIES from '../lib/defaultCategories';
import CATEGORY_IMAGES from '../lib/categoryImages';

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
        <HomeHero />
        <PromoBanner />
        <FeaturedProducts />
        <CategoryPromotion categories={categories} />
      </main>
    </div>
  );
};

export default HomePage;
