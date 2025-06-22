import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import CategoryCard from './CategoryCard';
import DEFAULT_CATEGORIES from '../lib/defaultCategories';
import type { Category } from '../types/category';

const CategoryPromotion: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.ok ? res.json() : { categories: DEFAULT_CATEGORIES })
      .then((data) => setCategories(data.categories || data || DEFAULT_CATEGORIES))
      .catch(() => setCategories(DEFAULT_CATEGORIES));
  }, []);

  return (
    <section className="bg-primary text-primary-content py-12">
      <div className="max-w-screen-xl mx-auto px-4">
        <h3 className="text-2xl font-bold mb-6 text-center">Shop by Category</h3>
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={16}
          slidesPerView={2}
          breakpoints={{
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
          }}
          className="mb-6"
        >
          {categories.map((cat) => (
            <SwiperSlide key={cat.name} className="pb-4">
              <CategoryCard category={cat} />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="text-center">
          <Link
            href="/categories"
            className="btn btn-outline bg-white text-primary hover:bg-white"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryPromotion;
