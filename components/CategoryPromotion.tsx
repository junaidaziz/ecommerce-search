import Link from 'next/link';
import CategorySlider, { CategoryItem } from './CategorySlider';

interface CategoryPromotionProps {
  categories: CategoryItem[];
}

const CategoryPromotion: React.FC<CategoryPromotionProps> = ({ categories }) => (
  <section className="py-12">
    <div className="max-w-screen-xl mx-auto px-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Browse Categories</h2>
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
