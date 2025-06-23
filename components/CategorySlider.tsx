import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y } from 'swiper/modules';
import 'swiper/css';

import styles from './CategorySlider.module.css';

export interface CategoryItem {
  name: string;
  slug?: string;
  image?: string;
}

interface CategorySliderProps {
  categories: CategoryItem[];
}

const placeholder = '/placeholder.png';

const CategorySlider: FC<CategorySliderProps> = ({ categories }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <Swiper
      modules={[A11y]}
      spaceBetween={10}
      slidesPerView={2.5}
      breakpoints={{
        640: { slidesPerView: 3.5 },
        768: { slidesPerView: 4.5 },
        1024: { slidesPerView: 5.5 },
      }}
      className={styles.slider}
    >
      {categories.map((cat) => (
        <SwiperSlide key={cat.slug ?? cat.name} className={styles.slide}>
          <Link
            href={`/products?category=${encodeURIComponent(
              cat.slug ?? cat.name
            )}`}
            className="block"
          >
            <div className={styles.imageWrapper}>
              <Image
                src={cat.image || placeholder}
                alt={cat.name}
                fill
                className={styles.image}
              />
            </div>
            <span className={styles.name}>{cat.name}</span>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default CategorySlider;
