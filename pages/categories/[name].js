import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { AppContext } from '../../contexts/AppContext';
import Head from 'next/head';

export default function CategoryPage() {
  const router = useRouter();
  const { name, type } = router.query;
  const { addToCart } = useContext(AppContext);
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
        const found = cats.find((c) => c.name.toLowerCase() === name.toLowerCase());
        if (found && found.image) setCatImage(found.image);
      }
    }
    load();
    loadCat();
  }, [name, type]);

  if (!name) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-screen-2xl mx-auto">
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
        {catImage && <img src={catImage} alt="" className="w-8 h-8 object-cover" />}
        <span>
          Category: {name}
          {type && ` - ${type}`}
        </span>
      </h1>
      {loading && <div>Loading...</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <div
            key={p.ID}
            className="bg-base-100 rounded-lg shadow-md p-4 flex flex-col"
          >
            <Link
              href={`/products/${p.ID}`}
              className="font-semibold mb-2 hover:underline"
            >
              {p.TITLE}
            </Link>
            <button
              className="btn btn-sm btn-primary mt-auto"
              onClick={() => addToCart(p)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
      {products.length === 0 && !loading && (
        <p>No products found in this category.</p>
      )}
    </div>
  );
}
