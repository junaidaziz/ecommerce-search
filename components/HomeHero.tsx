import Link from 'next/link';

const HomeHero: React.FC = () => (
  <section className="bg-base-200">
    <div className="max-w-screen-xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
        Shop the latest products
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Check out our newest arrivals and special offers.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/products" className="btn btn-primary">
          Shop Now
        </Link>
        <Link href="/about" className="btn btn-outline">
          Learn More
        </Link>
      </div>
    </div>
  </section>
);

export default HomeHero;
