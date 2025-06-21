import { useState, useEffect, useContext, FormEvent } from 'react';
import { AppContext } from '../contexts/AppContext';
import type { Product } from '../types/product';
import ProductCard from '../components/ProductCard';
import Head from 'next/head';
import { getPageTitle } from '../lib/pageTitle';
import Pagination from '../components/Pagination';

const Products: React.FC = () => {
  const { addToCart } = useContext(AppContext)!;
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('All');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const pageSize = 20;

  useEffect(() => {
    async function loadCats() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(['All', ...data.categories.map((c: { name: string }) => c.name)]);
        }
      } catch {
        setCategories(['All']);
      }
    }
    loadCats();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (category && category !== 'All') params.append('category', category);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      params.append('page', String(currentPage));
      params.append('perPage', String(pageSize));
      const res = await fetch(`/api/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.results as Product[]);
        setTotalPages(data.totalPages || 1);
      } else {
        setProducts([]);
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  return (
    <div className="w-full bg-gradient-to-br from-base-200 to-base-100 min-h-screen">
      <Head>
        <title>{getPageTitle('Products')}</title>
      </Head>
      <div className="max-w-screen-xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">Products</h1>
        <button
          type="button"
          className="btn btn-outline mb-4 sm:hidden"
          onClick={() => setFiltersOpen((o) => !o)}
        >
          {filtersOpen ? 'Hide Filters' : 'Show Filters'}
        </button>
        <form
          onSubmit={handleSubmit}
          className={`${filtersOpen ? '' : 'hidden'} sm:flex flex-wrap gap-4 mb-4 items-end`}
        >
          <div>
            <label htmlFor="search" className="block text-sm font-medium mb-1">
              Search
            </label>
            <input
              id="search"
              type="text"
              className="input input-bordered w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">
              Category
            </label>
            <select
              id="category"
              className="select select-bordered w-full"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="minPrice" className="block text-sm font-medium mb-1">
              Min Price
            </label>
            <input
              type="number"
              id="minPrice"
              className="input input-bordered w-full"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="maxPrice" className="block text-sm font-medium mb-1">
              Max Price
            </label>
            <input
              type="number"
              id="maxPrice"
              className="input input-bordered w-full"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">Apply</button>
        </form>
        {loading ? (
          <div className="flex justify-center my-4">
            <span className="loading loading-spinner"></span>
          </div>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Products;