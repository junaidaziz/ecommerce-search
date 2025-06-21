import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ProductCard from '../../components/ProductCard';
import Head from 'next/head';
import React from 'react';
import { Category, Product } from '../../types';


const CategoryPage: React.FC = () => {
  const router = useRouter();
  const { name, type } = router.query;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!name || Array.isArray(name)) return;
    async function load() {
      setLoading(true);
      const url = `/api/search?filterByCategory=${encodeURIComponent(name as string)}${
        type && typeof type === 'string' ? `&filterByType=${encodeURIComponent(type)}` : ''
      }`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.results || []);
      }
      setLoading(false);
    }
    load();
  }, [name, type]);

  if (!name || Array.isArray(name)) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-screen-2xl mx-auto min-h-screen p-4">
      <Head>
        <title>Category: {name}</title>
        <meta name="description" content={`Products for ${name}`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: name,
            }),
          }}
        />
      </Head>
      <h1 className="text-2xl font-bold mb-4">
        Category: {name}
        {type && typeof type === 'string' && ` - ${type}`}
      </h1>
      {loading && <div>Loading...</div>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {products.length === 0 && !loading && (
        <p>No products found in this category.</p>
      )}
    </div>
  );
};

export default CategoryPage;
