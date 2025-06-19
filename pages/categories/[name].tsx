import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '../../components/ProductCard';
import Head from 'next/head';

export default function CategoryPage() {
  const router = useRouter();
  const { name, type } = router.query;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catImage, setCatImage] = useState('');

  useEffect(() => {
    if (!name) return;
    async function load() {
      setLoading(true);
      const url = `/api/search?filterByCategory=${encodeURIComponent(name)}${
        type ? `&filterByType=${encodeURIComponent(type)}` : ''
      }`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.results || []);
      }
      setLoading(false);
    }
    async function loadCat() {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const cats = await res.json();
        const found = cats.find(
          (c) => c.name.toLowerCase() === name.toLowerCase()
        );
        if (found && found.image) setCatImage(found.image);
      }
    }
    load();
    loadCat();
  }, [name, type]);

  if (!name) return <div className="p-4">Loading...</div>;

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
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Image
          src={catImage || '/placeholder.png'}
          alt=""
          width={32}
          height={32}
          className="w-8 h-8 object-cover"
        />
        <span>
          Category: {name}
          {type && ` - ${type}`}
        </span>
      </h1>
      {loading && <div>Loading...</div>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {products.map((p) => (
          <ProductCard key={p.ID} product={p} />
        ))}
      </div>
      {products.length === 0 && !loading && (
        <p>No products found in this category.</p>
      )}
    </div>
  );
}
