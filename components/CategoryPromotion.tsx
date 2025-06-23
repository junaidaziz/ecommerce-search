import Link from 'next/link';

const CategoryPromotion: React.FC = () => (
  <section className="bg-primary text-primary-content py-12">
    <div className="max-w-screen-xl mx-auto px-4 text-center">
      <h3 className="text-2xl font-bold mb-4">Shop by Category</h3>
      <p className="mb-6">
        Find exactly what you need by browsing our categories.
      </p>
      <Link
        href="/categories"
        className="btn btn-outline bg-white text-primary hover:bg-white"
      >
        Browse Categories
      </Link>
    </div>
  </section>
);

export default CategoryPromotion;
