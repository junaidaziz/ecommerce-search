import Image from 'next/image';
import Link from 'next/link';
import styles from './CategoryPromotion.module.css';

export interface PromotionCategory {
  name: string;
  slug?: string;
  image?: string;
}

interface CategoryPromotionProps {
  categories: PromotionCategory[];
}

const placeholder = '/placeholder.png';

const CategoryPromotion: React.FC<CategoryPromotionProps> = ({ categories }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-12">
      <div className="max-w-screen-xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6 text-center">Browse Categories</h2>
        <div className={styles.grid}>
          {categories.map((cat) => (
            <Link
              key={cat.slug ?? cat.name}
              href={`/products?category=${encodeURIComponent(cat.slug ?? cat.name)}`}
              className={styles.card}
            >
              <Image
                src={cat.image || placeholder}
                alt={cat.name}
                fill
                className={styles.image}
              />
              <span className={styles.overlay}>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryPromotion;
