import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductImageSlider from './ProductImageSlider';
import { Product } from '../types/product';

interface RecommendedProductsProps {
  category?: string;
  excludeId?: string;
  title?: string;
}

export default function RecommendedProducts({ category, excludeId, title = 'You may also like' }: RecommendedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!category) return;
    fetch(`/api/search?category=${encodeURIComponent(category)}&perPage=4`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.results)) {
          const filtered = data.results.filter((p: Product) => p.ID !== excludeId);
          setProducts(filtered);
        }
      })
      .catch(() => {});
  }, [category, excludeId]);

  if (!products.length) return null;

  return (
    <div className="mt-8">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <Link href={`/product/${p.SLUG}`} key={p.ID} className="card bg-base-100 border border-base-300 rounded-xl shadow hover:shadow-lg transition-all duration-200">
            <ProductImageSlider
              images={p.IMAGES && p.IMAGES.length > 0 ? p.IMAGES : [p.FEATURED_IMAGE?.url]}
              placeholderSeed={Number(p.ID)}
              className="w-full h-32 bg-gray-200 overflow-hidden flex items-center justify-center"
              imgClass="w-full h-full object-cover"
            />
            <div className="p-2 text-sm line-clamp-2">{p.TITLE}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
