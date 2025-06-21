import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import ProductCard from '../../components/ProductCard';
import { getPageTitle } from '../../lib/pageTitle';
import type { Product } from '../../types/product';

const LIMIT = 24;

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/products?limit=${LIMIT}&offset=${offsetRef.current}`
      );
      if (res.ok) {
        const data = await res.json();
        const newProducts = (data.products as Product[]) || [];
        setProducts((prev) => [...prev, ...newProducts]);
        offsetRef.current += newProducts.length;
        if (newProducts.length < LIMIT) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    fetchMore();
  }, [fetchMore]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchMore();
      }
    });
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [fetchMore]);

  return (
    <div className="min-h-screen bg-base-200 py-10">
      <Head>
        <title>{getPageTitle('Products')}</title>
      </Head>
      <div className="max-w-screen-xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">Products</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {loading && (
          <div className="flex justify-center my-4">
            <span className="loading loading-spinner"></span>
          </div>
        )}
        {hasMore && <div ref={loadMoreRef} className="h-1" />}
      </div>
    </div>
  );
}
