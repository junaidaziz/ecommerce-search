import Link from 'next/link';
import { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { AppContext } from '../contexts/AppContext';

export default function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const { cart } = useContext(AppContext);
  const user = session?.user;
  const logout = () => signOut({ redirect: false });
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
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(search)}&pageSize=5`,
          { signal: controller.signal }
        );
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
  const submitSearch = (e) => {
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
      <div className="flex-1 flex items-center gap-2">
        <Link href="/" className="btn btn-ghost normal-case text-xl">
          Home
        </Link>
        <form onSubmit={submitSearch} className="relative">
          <input
            className="input input-bordered w-40 md:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 bg-base-100 border rounded-box mt-1 w-full max-h-60 overflow-auto">
              {suggestions.map((s) => (
                <li key={s.ID}>
                  <button
                    type="button"
                    className="block w-full text-left px-2 py-1 hover:bg-base-200"
                    onClick={() => selectSuggestion(s)}
                  >
                    {s.TITLE}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>
      </div>
      <div className="hidden md:flex flex-none gap-2">
        <div className="dropdown dropdown-hover">
          <label tabIndex={0} className="btn btn-outline">
            Categories
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            {categories.map((cat) => (
              <li key={cat}>
                <Link href={`/?type=${encodeURIComponent(cat)}`}>{cat}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative mr-2">
          <Link href="/cart" className="btn btn-ghost flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
            Cart
          </Link>
          {itemCount > 0 && (
            <span className="badge badge-sm badge-primary absolute -top-2 -right-2">
              {itemCount}
            </span>
          )}
        </div>
        {user ? (
          <>
            {user.role === 'admin' ? (
              <Link href="/admin" className="btn btn-ghost mr-2">
                Admin
              </Link>
            ) : (
              <Link href="/orders" className="btn btn-ghost mr-2">
                Orders
              </Link>
            )}
            <span className="px-2">Hello, {user.firstName || user.email}</span>
            <button onClick={logout} className="btn btn-outline ml-2">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-ghost">
              Login
            </Link>
            <Link href="/signup" className="btn btn-primary ml-2">
              Signup
            </Link>
          </>
        )}
      </div>

      <div className="md:hidden flex-none">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-square btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>
          <ul tabIndex={0} className="menu dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <div className="relative flex items-center">
                <Link href="/cart" className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-5 h-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                    />
                  </svg>
                  Cart
                </Link>
                {itemCount > 0 && (
                  <span className="badge badge-sm badge-primary absolute -top-2 -right-2">
                    {itemCount}
                  </span>
                )}
              </div>
            </li>
            {categories.length > 0 && (
              <li>
                <details>
                  <summary>Categories</summary>
                  <ul>
                    {categories.map(cat => (
                      <li key={cat}>
                        <Link href={`/?type=${encodeURIComponent(cat)}`}>{cat}</Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            )}
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <li><Link href="/admin">Admin</Link></li>
                ) : (
                  <li><Link href="/orders">Orders</Link></li>
                )}
                <li><button type="button" onClick={logout}>Logout</button></li>
              </>
            ) : (
              <>
                <li><Link href="/login">Login</Link></li>
                <li><Link href="/signup">Signup</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </header>
  );
}
