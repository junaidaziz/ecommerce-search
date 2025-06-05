import Link from 'next/link';
import { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AppContext } from '../contexts/AppContext';

export default function Header() {
  const router = useRouter();
  const { user, cart } = useContext(AppContext);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/search');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.productTypes || []);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(search)}&pageSize=5`, { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.results || []);
        }
      } catch (_) {
        // ignore
      }
    }, 300);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [search]);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const submitSearch = e => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/?q=${encodeURIComponent(search)}`);
    setSuggestions([]);
  };

  const selectSuggestion = (p) => {
    router.push(`/products/${p.ID}`);
    setSuggestions([]);
    setSearch('');
  };
  return (
    <header className="navbar bg-base-300 mb-6">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost normal-case text-xl">Home</Link>
      </div>
      <div className="flex-none gap-2">
        <div className="dropdown dropdown-hover">
          <label tabIndex={0} className="btn btn-outline">Categories</label>
          <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
            {categories.map(cat => (
              <li key={cat}>
                <Link href={`/?type=${encodeURIComponent(cat)}`}>{cat}</Link>
              </li>
            ))}
          </ul>
        </div>
        <form onSubmit={submitSearch} className="relative">
          <input
            className="input input-bordered w-40 md:w-64"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 bg-base-100 border rounded-box mt-1 w-full max-h-60 overflow-auto">
              {suggestions.map(s => (
                <li key={s.ID}>
                  <button type="button" className="block w-full text-left px-2 py-1 hover:bg-base-200" onClick={() => selectSuggestion(s)}>
                    {s.TITLE}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>
        <Link href="/cart" className="btn btn-ghost mr-2">
          Cart
          {itemCount > 0 && (
            <span className="badge badge-sm badge-primary ml-2">{itemCount}</span>
          )}
        </Link>
        {user ? (
          <span className="px-4">Hello, {user.firstName || user.email}</span>
        ) : (
          <>
            <Link href="/login" className="btn btn-ghost">Login</Link>
            <Link href="/signup" className="btn btn-primary ml-2">Signup</Link>
          </>
        )}
      </div>
    </header>
  );
}
