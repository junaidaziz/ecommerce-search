import Link from 'next/link';
import { useContext, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import type { FC, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { AppContext, AppContextValue } from '../contexts/AppContext';
import SearchIcon from './icons/SearchIcon';
import CartIcon from './icons/CartIcon';
import MoonIcon from './icons/MoonIcon';
import SunIcon from './icons/SunIcon';
import MenuIcon from './icons/MenuIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import ElectronicsIcon from './icons/ElectronicsIcon';
import FashionIcon from './icons/FashionIcon';
import { Theme } from 'react-select';
import type { Category } from '../types/category';
import type {
  CategoriesResponse,
  SuggestionsResponse,
  TrendingResponse,
} from '../types/api';

import type { Product } from '../types/product';

type CartItem = Product & { qty: number };

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  firstName?: string;
}

interface HeaderProps {
  theme?: string;
  setTheme?: React.Dispatch<React.SetStateAction<string>>;
}

const Header: FC<HeaderProps> = ({ theme = 'light', setTheme }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const appContext = useContext(AppContext) as AppContextValue | undefined;
  const cart = appContext?.cart ?? [];
  const user = session?.user as User | undefined;
  const pathname = router.pathname || '';
  const isSignupRoute = pathname.startsWith('/signup');
  const isLoginRoute = pathname === '/login';
  const logout = () => signOut({ redirect: false });
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingKeywords, setTrendingKeywords] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const searchRef = useRef<HTMLFormElement | null>(null);
  const iconMap: Record<string, JSX.Element> = {
    Electronics: <ElectronicsIcon className="h-5 w-5 mr-1" />,
    Fashion: <FashionIcon className="h-5 w-5 mr-1" />,
  };

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data: CategoriesResponse = await res.json();
          setCategories(data.categories || data || []);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 5));
        }
      } catch {
        // ignore
      }
    }
    async function loadTrending() {
      try {
        const res = await fetch('/api/trending');
        if (res.ok) {
          const data: TrendingResponse = await res.json();
          setTrendingKeywords(data.keywords || []);
        }
      } catch {
        // ignore
      }
    }
    loadTrending();
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        searchRef.current &&
        !searchRef.current.contains(target) &&
        !(typeof (target as Element).closest === 'function' &&
          (target as Element).closest('#mega-menu'))
      ) {
        setMenuOpen(false);
        setShowHistory(false);
      }
    }
    document.addEventListener('keydown', handleKey as EventListener);
    document.addEventListener('click', handleClick as EventListener);
    return () => {
      document.removeEventListener('keydown', handleKey as EventListener);
      document.removeEventListener('click', handleClick as EventListener);
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
          `/api/suggest?q=${encodeURIComponent(search)}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data: SuggestionsResponse = await res.json();
          setSuggestions(data.suggestions || []);
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

  useEffect(() => {
    if (search.trim()) {
      setShowHistory(false);
    }
  }, [search]);

  const storeSearch = (term: string) => {
    const stored = localStorage.getItem('recentSearches');
    let arr: string[] = [];
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) arr = parsed;
      } catch {
        // ignore parse errors
      }
    }
    const updated = [term, ...arr.filter((t) => t !== term)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    setRecentSearches(updated);
  };

  const runSearch = (term: string) => {
    router.push(`/?q=${encodeURIComponent(term)}`);
    storeSearch(term);
    setSuggestions([]);
    setShowHistory(false);
  };

  const chooseTerm = (term: string) => {
    setSearch(term);
    runSearch(term);
  };
  const itemCount = cart.reduce((sum: number, item: CartItem) => sum + (item.qty || 0), 0);
  const submitSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!search.trim()) return;
    runSearch(search.trim());
  };

  const selectSuggestion = (text: string) => {
    router.push(`/?q=${encodeURIComponent(text)}`);
    setSuggestions([]);
    setSearch(text);
  };

  const renderCat = (cat: Category): JSX.Element => (
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
    <header className="bg-base-300 mb-6">
      <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <Link href="/" className="btn btn-ghost normal-case text-xl">
            Home
          </Link>
        </div>
        <div
          className="flex-1 flex items-center gap-x-4"
          onMouseLeave={() => setMenuOpen(false)}
        >
          <ul className="menu menu-horizontal gap-2 hidden md:flex">
            <li className="relative">
              <button
                type="button"
                className="flex items-center gap-1 font-semibold transition-colors duration-200 hover:text-primary"
                onMouseEnter={() => setMenuOpen(true)}
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
              >
                Categories
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              {menuOpen && (
                <div
                  id="mega-menu"
                  className="absolute left-0 top-full mt-1 z-40 p-4 bg-base-100 shadow-lg rounded w-screen max-w-3xl"
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
                            className="flex items-center font-semibold mb-1 transition-colors duration-200 hover:text-primary"
                          >
                            {cat.image ? (
                              <Image
                                src={cat.image}
                                alt=""
                                width={16}
                                height={16}
                                className="w-4 h-4 mr-1 object-cover"
                              />
                            ) : (
                              iconMap[cat.name] || null
                            )}
                            {cat.name}
                          </Link>
                          {cat.subcategories &&
                            cat.subcategories.length > 0 && (
                              <ul className="ml-4 space-y-1">
                                {cat.subcategories.slice(0, 5).map((sub) => (
                                  <li key={sub} className="text-sm">
                                    <Link
                                      href={`/categories/${encodeURIComponent(cat.name)}?type=${encodeURIComponent(sub)}`}
                                      className="transition-colors duration-200 hover:text-primary"
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
                      <p className="text-gray-500">No categories found</p>
                    )}
                  </div>
                </div>
              )}
            </li>
          </ul>
          <form
            onSubmit={submitSearch}
            ref={searchRef}
            className="relative flex-1 max-w-lg"
          >
            <input
              className="input input-bordered w-full pr-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e: ReactKeyboardEvent<HTMLInputElement>) => {
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
              role="combobox"
              aria-expanded={suggestions.length > 0 || showHistory}
              aria-haspopup="listbox"
              aria-controls="search-suggestions"
              onFocus={() => setShowHistory(true)}
            />
            <SearchIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            {suggestions.length > 0 && (
              <ul
                id="search-suggestions"
                role="listbox"
                className="absolute z-10 bg-white shadow rounded mt-1 w-full max-h-60 overflow-auto"
              >
                {suggestions.map((s, idx) => (
                  <li key={s}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={idx === activeIdx}
                      className={`block w-full text-left px-2 py-1 ${idx === activeIdx ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-base-200'}`}
                      onMouseEnter={() => setActiveIdx(idx)}
                      onClick={() => selectSuggestion(s)}
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {showHistory && suggestions.length === 0 && (
              <ul
                id="search-suggestions"
                role="listbox"
                className="absolute z-10 bg-white shadow rounded mt-1 w-full max-h-60 overflow-auto"
              >
                {recentSearches.length > 0 && (
                  <>
                    <li className="px-2 py-1 text-xs text-gray-500">
                      Recent Searches
                    </li>
                    {recentSearches.map((term) => (
                      <li key={`recent-${term}`}>
                        <button
                          type="button"
                          className="block w-full text-left px-2 py-1 hover:bg-base-200"
                          onClick={() => chooseTerm(term)}
                        >
                          {term}
                        </button>
                      </li>
                    ))}
                  </>
                )}
                {trendingKeywords.length > 0 && (
                  <>
                    <li className="px-2 py-1 text-xs text-gray-500">
                      Trending
                    </li>
                    {trendingKeywords.map((term) => (
                      <li key={`trend-${term}`}>
                        <button
                          type="button"
                          className="block w-full text-left px-2 py-1 hover:bg-base-200"
                          onClick={() => chooseTerm(term)}
                        >
                          {term}
                        </button>
                      </li>
                    ))}
                  </>
                )}
              </ul>
            )}
          </form>
        </div>
        <nav className="flex flex-none items-center gap-x-2">
          <ul className="menu menu-horizontal gap-x-2 items-center">
            <li className="relative mr-1">
              <Link
                href="/cart"
                className="p-2 rounded-full shadow-sm transition-colors duration-200 hover:bg-base-200"
              >
                <CartIcon className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                    {itemCount}
                  </span>
                )}
              </Link>
            </li>
            <li className="flex items-center">
              <label className="swap swap-rotate">
                <input
                  type="checkbox"
                  checked={theme === 'dark'}
                  onChange={() => setTheme && setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-label="Toggle Dark Mode"
                />
                <MoonIcon className="swap-on fill-current w-5 h-5" />
                <SunIcon className="swap-off fill-current w-5 h-5" />
              </label>
            </li>
            {user ? (
              <>
                {user.role === 'super-admin' ? (
                  <>
                    <li>
                      <Link href="/admin" className="btn btn-ghost">
                        Admin
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin/analytics" className="btn btn-ghost">
                        Analytics
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link href="/user/orders" className="btn btn-ghost">
                        Orders
                      </Link>
                    </li>
                    <li>
                      <Link href="/user/wishlist" className="btn btn-ghost">
                        Wishlist
                      </Link>
                    </li>
                  </>
                )}
                <li className="px-2 flex items-center">
                  Hello, {user.firstName || user.email}
                </li>
                <li>
                  <button onClick={logout} className="btn btn-outline">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                {!isLoginRoute && (
                  <li>
                    <Link href="/login" className="btn btn-ghost">
                      Login
                    </Link>
                  </li>
                )}
                {!isSignupRoute && (
                  <li>
                    <Link href="/signup" className="btn btn-primary">
                      Signup
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>
        </nav>

        <div className="md:hidden flex-none">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-square btn-ghost">
              <MenuIcon className="h-5 w-5" />
            </label>
            <ul
              tabIndex={0}
              className="menu dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li className="relative">
                <Link
                  href="/cart"
                  className="p-2 rounded-full shadow-sm transition-colors duration-200 hover:bg-base-200"
                >
                  <CartIcon className="w-5 h-5" />
                </Link>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                    {itemCount}
                  </span>
                )}
              </li>
              <li className="flex items-center px-2">
                <label className="swap swap-rotate">
                  <input
                    type="checkbox"
                    checked={theme === 'dark'}
                    onChange={() =>
                      setTheme && setTheme(theme === 'dark' ? 'light' : 'dark')
                    }
                    aria-label="Toggle Dark Mode"
                  />
                  <MoonIcon className="swap-on fill-current w-5 h-5" />
                  <SunIcon className="swap-off fill-current w-5 h-5" />
                </label>
              </li>
              <li>
                <details>
                  <summary>Categories</summary>
                  <ul>
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <li key={cat.name}>
                          <div className="flex items-center gap-1">
                            {cat.image ? (
                              <Image
                                src={cat.image}
                                alt=""
                                width={16}
                                height={16}
                                className="w-4 h-4 object-cover"
                              />
                            ) : (
                              iconMap[cat.name] || null
                            )}
                            <Link
                              href={`/categories/${encodeURIComponent(cat.name)}`}
                            >
                              {cat.name}
                            </Link>
                          </div>
                          {cat.subcategories &&
                            cat.subcategories.length > 0 && (
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
                      <li className="text-gray-500 px-2 py-1">
                        No categories found
                      </li>
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
                  {!isLoginRoute && (
                    <li>
                      <Link href="/login">Login</Link>
                    </li>
                  )}
                  {!isSignupRoute && (
                    <li>
                      <Link href="/signup">Signup</Link>
                    </li>
                  )}
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
