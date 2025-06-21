import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  FormEvent,
} from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getPageTitle } from '../lib/pageTitle';
import HeroSlider from '../components/HeroSlider';
import ProductCard from '../components/ProductCard';
import DEFAULT_CATEGORIES from '../lib/defaultCategories';
import { Product } from '../types/product';

interface SearchResult extends Product {
  highlights?: { field: string; snippet: string }[];
}

interface SearchApiResponse {
  results: SearchResult[];
  total: number;
  page: number;
  totalPages: number;
  brands: string[];
  categories: string[];
  fallback: Product[];
}

interface HistoryInfo {
  category?: string;
  id?: string;
}

const Home: React.FC & { heroSecond?: typeof HeroSlider } = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [products, setProducts] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<string>('sold_count_desc');
  const [filterByVendor, setFilterByVendor] = useState<string>('All');
  const [filterByCategory, setFilterByCategory] = useState<string>('All');
  const [filterByType, setFilterByType] = useState<string>('All');
  const [inStock, setInStock] = useState<boolean>(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const pageSize = 20;

  const [allVendors, setAllVendors] = useState<string[]>([]);
  const [allProductTypes, setAllProductTypes] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [historyInfo, setHistoryInfo] = useState<HistoryInfo | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const qParam = router.query.q;
    if (qParam) {
      const q = Array.isArray(qParam) ? qParam[0] : (qParam as string);
      setSearchTerm(q);
    } else {
      setSearchTerm('');
    }
  }, [router.query.q]);

  useEffect(() => {
    const typeParam = router.query.type;
    if (typeParam) {
      const t = Array.isArray(typeParam) ? typeParam[0] : (typeParam as string);
      setFilterByType(t);
    } else {
      setFilterByType('All');
    }
  }, [router.query.type]);

  useEffect(() => {
    const catParam = router.query.filterByCategory;
    if (catParam) {
      const c = Array.isArray(catParam) ? catParam[0] : (catParam as string);
      setFilterByCategory(c);
    } else {
      setFilterByCategory('All');
    }
  }, [router.query.filterByCategory]);

  useEffect(() => {
    async function loadCats() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data: { name: string }[] = await res.json();
          const names = data.map((c) => c.name);
          const list =
            names.length > 0 ? names : DEFAULT_CATEGORIES.map((c) => c.name);
          setAllCategories(['All', ...list]);
        } else {
          setAllCategories(['All', ...DEFAULT_CATEGORIES.map((c) => c.name)]);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
        setAllCategories(['All', ...DEFAULT_CATEGORIES.map((c) => c.name)]);
      }
    }
    loadCats();
  }, []);

  useEffect(() => {
    try {
      const hist: string[] = JSON.parse(
        localStorage.getItem('browse-history') || '[]'
      );
      if (hist.length > 0) {
        fetch(`/api/products/${hist[0]}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data && data.CATEGORY) {
              setHistoryInfo({ category: data.CATEGORY, id: hist[0] });
            }
          })
          .catch(() => {});
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchProducts = useCallback(async (): Promise<void> => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (sortBy) params.append('sort', sortBy);
      if (filterByVendor && filterByVendor !== 'All')
        params.append('brand', filterByVendor);
      if (filterByCategory && filterByCategory !== 'All')
        params.append('filterByCategory', filterByCategory);
      if (filterByType && filterByType !== 'All')
        params.append('filterByType', filterByType);
      if (inStock) params.append('inStock', 'true');
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      params.append('page', String(currentPage));
      params.append('perPage', String(pageSize));

      const queryString = params.toString();
      const response = await fetch(
        `/api/search${queryString ? `?${queryString}` : ''}`,
        { signal }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SearchApiResponse = await response.json();
      setProducts(data.results as SearchResult[]);
      setTotalPages(data.totalPages || 1);
      if (allVendors.length === 0 && Array.isArray(data.brands)) {
        setAllVendors(['All', ...data.brands]);
      }
      if (allCategories.length === 0 && Array.isArray(data.categories)) {
        setAllCategories(['All', ...data.categories]);
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') {
        console.log('Fetch aborted:', searchTerm);
      } else {
        console.error('Failed to fetch products:', e);
        setError('Failed to load products. Please try again.');
        setProducts([]);
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [
    searchTerm,
    sortBy,
    filterByVendor,
    filterByCategory,
    filterByType,
    inStock,
    minPrice,
    maxPrice,
    currentPage,
    pageSize,
    allVendors.length,
    allProductTypes.length,
    allCategories.length,
  ]);

  useEffect(() => {
    fetchProducts();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProducts]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleTypeClick = (type: string) => {
    setFilterByType(type);
    setCurrentPage(1);
    const query = { ...router.query };
    if (type && type !== 'All') {
      query.type = type;
    } else {
      delete query.type;
    }
    router.replace({ pathname: '/', query }, undefined, { shallow: true });
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const activeFilters: { label: string; clear: () => void }[] = [];
  if (filterByVendor !== 'All')
    activeFilters.push({
      label: filterByVendor,
      clear: () => {
        setFilterByVendor('All');
        setCurrentPage(1);
      },
    });
  if (filterByType !== 'All')
    activeFilters.push({
      label: filterByType,
      clear: () => handleTypeClick('All'),
    });
  if (filterByCategory !== 'All')
    activeFilters.push({
      label: filterByCategory,
      clear: () => {
        setFilterByCategory('All');
        setCurrentPage(1);
      },
    });
  if (inStock)
    activeFilters.push({
      label: 'In Stock',
      clear: () => {
        setInStock(false);
        setCurrentPage(1);
      },
    });
  if (minPrice)
    activeFilters.push({
      label: `Min £${minPrice}`,
      clear: () => {
        setMinPrice('');
        setCurrentPage(1);
      },
    });
  if (maxPrice)
    activeFilters.push({
      label: `Max £${maxPrice}`,
      clear: () => {
        setMaxPrice('');
        setCurrentPage(1);
      },
    });

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center py-10 font-sans">
      <Head>
        <title>{getPageTitle('Home')}</title>
        <meta name="description" content="Search products from CSV data" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {loading ? (
        <div className="flex justify-center my-4 w-full">
          <span className="loading loading-spinner"></span>
        </div>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No products found</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              highlightTitle={
                p.highlights?.find((h) => h.field === 'title')?.snippet
              }
              highlightDescription={
                p.highlights?.find((h) => h.field === 'description')?.snippet
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

Home.heroSecond = HeroSlider;

export default Home;
