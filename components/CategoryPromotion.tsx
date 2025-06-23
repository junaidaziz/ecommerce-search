import Link from 'next/link';
import CategorySlider, { CategoryItem } from './CategorySlider';

interface CategoryPromotionProps {
  categories: CategoryItem[];
}

const CategoryPromotion: React.FC<CategoryPromotionProps> = ({ categories }) => (
  <section className="py-12 bg-primary text-white">
    <div className="max-w-screen-xl mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold mb-2">Browse Categories</h2>
      <p className="mb-6">Find exactly what you need…</p>
      <CategorySlider categories={categories} />
      <div className="text-center mt-8">
        <Link
          href="/categories"
          className="btn btn-outline bg-white text-primary hover:bg-white"
        >
          Browse Categories
        </Link>
      </div>
    </div>
  </section>
);

export default CategoryPromotion;
