import Link from 'next/link';
import { useContext, useState, useEffect, useRef } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const searchRef = useRef(null);
  const iconMap = {
    Electronics: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 17v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2m-6 0V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0h6"
        />
      </svg>
    ),
    Fashion: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 7l8-4 8 4M4 7v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7M4 7l8 4 8-4"
        />
      </svg>
    ),
  };

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data || []);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    function handleClick(e) {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target) &&
        !(e.target.closest && e.target.closest('#mega-menu'))
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('keydown', handleKey);
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      setActiveIdx(-1);
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
          setActiveIdx(-1);
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

  const renderCat = (cat) => (
    <li key={cat.id} className={cat.parentId ? 'ml-4' : ''}>
      <Link href={`/categories/${encodeURIComponent(cat.name)}`}>
        {cat.name}
      </Link>
      {cat.children && cat.children.length > 0 && (
        <ul className="ml-4">
          {cat.children.map((child) => renderCat(child))}
        </ul>
      )}
    </li>
  );
  return (
    <header className="navbar bg-base-300 mb-6">
      <div className="flex-1 flex items-center gap-2">
        <Link href="/" className="btn btn-ghost normal-case text-xl">
          Home
        </Link>
        <nav className="hidden md:flex" onMouseLeave={() => setMenuOpen(false)}>
          <ul className="menu menu-horizontal gap-2">
            <li className="relative">
              <button
                type="button"
                className="flex items-center gap-1 font-semibold"
                onMouseEnter={() => setMenuOpen(true)}
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
              >
                Categories
                <svg
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {menuOpen && (
                <div
                  id="mega-menu"
                  className="absolute left-0 top-full mt-2 z-20 p-4 bg-base-100 shadow-lg rounded w-screen max-w-3xl"
                >
                  <div
                    className="grid grid-cols-2 md:grid-cols-3 gap-4"
                    role="menu"
                  >
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <div
                          key={cat.name}
                          className="pb-2 border-b last:border-b-0"
                          role="none"
                        >
                          <Link
                            href={`/categories/${encodeURIComponent(cat.name)}`}
                            className="flex items-center font-semibold mb-1 hover:text-indigo-600"
                          >
                            {iconMap[cat.name] || null}
                            {cat.name}
                          </Link>
                          {cat.subcategories &&
                            cat.subcategories.length > 0 && (
                              <ul className="ml-4 space-y-1">
                                {cat.subcategories.slice(0, 5).map((sub) => (
                                  <li key={sub} className="text-sm">
                                    <Link
                                      href={`/categories/${encodeURIComponent(cat.name)}?type=${encodeURIComponent(sub)}`}
                                      className="hover:text-indigo-600"
                                    >
                                      {sub}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No categories</p>
                    )}
                  </div>
                </div>
              )}
            </li>
          </ul>
        </nav>
        <form
          onSubmit={submitSearch}
          ref={searchRef}
          className="relative flex-1 max-w-lg"
        >
          <input
            className="input input-bordered w-full pr-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (suggestions.length === 0) return;
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIdx((i) => (i + 1) % suggestions.length);
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIdx(
                  (i) => (i - 1 + suggestions.length) % suggestions.length
                );
              } else if (e.key === 'Enter' && activeIdx >= 0) {
                e.preventDefault();
                selectSuggestion(suggestions[activeIdx]);
              }
            }}
            placeholder="Search for products, brands..."
            aria-expanded={suggestions.length > 0}
            aria-haspopup="listbox"
          />
          <svg
            className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 3 10.5a7.5 7.5 0 0 0 13.65 6.15z"
            />
          </svg>
          {suggestions.length > 0 && (
            <ul
              id="search-suggestions"
              role="listbox"
              className="absolute z-10 bg-white shadow rounded mt-1 w-full max-h-60 overflow-auto"
            >
              {suggestions.map((s, idx) => (
                <li key={s.ID}>
                  <button
                    type="button"
                    role="option"
                    className={`block w-full text-left px-2 py-1 ${idx === activeIdx ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-base-200'}`}
                    onMouseEnter={() => setActiveIdx(idx)}
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
      <nav className="hidden md:flex flex-none ml-auto">
        <ul className="menu menu-horizontal gap-2">
          <li className="relative mr-1">
            <Link
              href="/cart"
              className="p-2 rounded-full shadow-sm hover:bg-base-200"
            >
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
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                  {itemCount}
                </span>
              )}
            </Link>
          </li>
          {user ? (
            <>
              {user.role === 'super-admin' ? (
                <>
                  <li>
                    <Link href="/admin" className="btn btn-ghost mr-2">
                      Admin
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/analytics" className="btn btn-ghost mr-2">
                      Analytics
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/user/orders" className="btn btn-ghost mr-2">
                      Orders
                    </Link>
                  </li>
                  <li>
                    <Link href="/user/wishlist" className="btn btn-ghost mr-2">
                      Wishlist
                    </Link>
                  </li>
                </>
              )}
              <li className="px-2 flex items-center">
                Hello, {user.firstName || user.email}
              </li>
              <li>
                <button onClick={logout} className="btn btn-outline ml-2">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/login" className="btn btn-ghost">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/signup" className="btn btn-primary ml-2">
                  Signup
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className="md:hidden flex-none">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-square btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li className="relative">
              <Link
                href="/cart"
                className="p-2 rounded-full shadow-sm hover:bg-base-200"
              >
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
                </Link>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                  {itemCount}
                </span>
              )}
            </li>
            <li>
              <details>
                <summary>Categories</summary>
                <ul>
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <li key={cat.name}>
                        <div className="flex items-center gap-1">
                          {iconMap[cat.name] || null}
                          <Link
                            href={`/categories/${encodeURIComponent(cat.name)}`}
                          >
                            {cat.name}
                          </Link>
                        </div>
                        {cat.subcategories && cat.subcategories.length > 0 && (
                          <ul className="ml-4">
                            {cat.subcategories.slice(0, 5).map((sub) => (
                              <li key={sub}>
                                <Link
                                  href={`/categories/${encodeURIComponent(cat.name)}?type=${encodeURIComponent(sub)}`}
                                >
                                  {sub}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 px-2 py-1">No categories</li>
                  )}
                </ul>
              </details>
            </li>
            {user ? (
              <>
              {user.role === 'super-admin' ? (
                <>
                  <li>
                    <Link href="/admin">Admin</Link>
                  </li>
                  <li>
                    <Link href="/admin/analytics">Analytics</Link>
                  </li>
                </>
              ) : user.role === 'brand' ? (
                <>
                  <li>
                    <Link href="/brand/profile">Profile</Link>
                  </li>
                  <li>
                    <Link href="/brand/analytics">Analytics</Link>
                  </li>
                </>
              ) : (
                  <>
                    <li>
                      <Link href="/user/orders">Orders</Link>
                    </li>
                    <li>
                      <Link href="/user/wishlist">Wishlist</Link>
                    </li>
                  </>
                )}
                <li>
                  <button type="button" onClick={logout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login">Login</Link>
                </li>
                <li>
                  <Link href="/signup">Signup</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </header>
  );
}
