import { useRouter } from 'next/router';
import { useEffect, useState, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import Link from 'next/link';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { addToCart } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setProduct(data);
      } catch (e) {
        setError('Failed to load product');
      }
    }
    load();
  }, [id]);

  if (error) return <div className="p-4">{error}</div>;
  if (!product) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{product.TITLE}</h1>
      <div className="mb-4 w-full flex justify-center">
        {product.FEATURED_IMAGE?.url ? (
          <img src={product.FEATURED_IMAGE.url} alt={product.TITLE} className="object-cover max-h-96" />
        ) : (
          <img src="https://placehold.co/600x400?text=No+Image" alt="No image" className="object-cover max-h-96" />
        )}
      </div>
      <p className="mb-2">Vendor: {product.VENDOR}</p>
      <p className="mb-2">Type: {product.PRODUCT_TYPE}</p>
      <p className="mb-4">{product.DESCRIPTION_TEXT || product.BODY_HTML_TEXT || 'No description available.'}</p>
      <p className="text-lg font-bold mb-4">{product.CURRENCY} {parseFloat(product.MIN_PRICE).toFixed(2)}</p>
      <button className="btn btn-primary" onClick={() => addToCart(product)}>Add to Cart</button>
      <div className="mt-4">
        <Link href="/">&larr; Back to products</Link>
      </div>
    </div>
  );
}
