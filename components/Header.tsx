import Link from 'next/link';
import { useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import type { FC } from 'react';
import { AppContext } from '../contexts/AppContext';
import SearchIcon from './icons/SearchIcon';
import CartIcon from './icons/CartIcon';
import MoonIcon from './icons/MoonIcon';
import SunIcon from './icons/SunIcon';
import MenuIcon from './icons/MenuIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import ElectronicsIcon from './icons/ElectronicsIcon';
import FashionIcon from './icons/FashionIcon';
import DEFAULT_CATEGORIES from '../lib/defaultCategories';
import type { Category } from '../types/category';
import type { Product } from '../types/product';
import type { User } from '../types/user';

interface HeaderProps {
  theme?: string;
  setTheme?: React.Dispatch<React.SetStateAction<string>>;
}

const Header: FC<HeaderProps> = ({ theme = 'light', setTheme }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const appContext = useContext(AppContext);
  const cart = appContext?.cart ?? [];
  const user = session?.user as User | undefined;
  const pathname = router.pathname;
  const isAuthRoute = ['/login', '/signup', '/user/signup', '/brand/signup'].includes(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hoveredCat, setHoveredCat] = useState<Category | null>(null);
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLFormElement>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleMenuEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setMenuOpen(true);
  };

  const handleMenuLeave = () => {
    closeTimeout.current = setTimeout(() => setMenuOpen(false), 150);
  };

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || data || DEFAULT_CATEGORIES))
      .catch(() => setCategories(DEFAULT_CATEGORIES));
  }, []);

  useEffect(() => {
    if (menuOpen && categories.length > 0) {
      setHoveredCat(categories[0]);
    }
  }, [menuOpen, categories]);

  const itemCount = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  const logout = () => signOut({ redirect: false });

  const iconMap: Record<string, JSX.Element> = {
    Electronics: <ElectronicsIcon className="h-5 w-5 mr-1" />,
    Fashion: <FashionIcon className="h-5 w-5 mr-1" />,
  };

  const submitSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="relative bg-base-300 mb-6">
      <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link href="/" className="btn btn-ghost text-xl">Home</Link>

        <div className="flex-1 flex items-center gap-x-4">
          <ul className="menu menu-horizontal hidden md:flex">
            <li className="relative">
              <div onMouseEnter={handleMenuEnter} onMouseLeave={handleMenuLeave}>
                <button
                  type="button"
                  className="flex items-center gap-1"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  onMouseEnter={handleMenuEnter}
                >
                  Categories{' '}
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {menuOpen && (
                  <div
                    id="mega-menu"
                    onMouseEnter={handleMenuEnter}
                    onMouseLeave={handleMenuLeave}
                    className="absolute left-0 top-full mt-1 z-50 p-4 bg-base-100 bg-opacity-100 border border-base-200 shadow-lg rounded w-screen max-w-3xl"
                  >
                    <div className="flex gap-6">
                      <div className="w-56 pr-4 space-y-2 border-r border-base-200">
                        {categories.map((cat) => (
                          <button
                            key={cat.name}
                            type="button"
                            onFocus={() => setHoveredCat(cat)}
                            onMouseEnter={() => setHoveredCat(cat)}
                            className="w-full flex items-center gap-1 text-left font-medium text-gray-800 tracking-wide hover:text-primary transition-colors focus:outline-none capitalize whitespace-nowrap truncate"
                          >
                            {iconMap[cat.name] || null}
                            {cat.name}
                          </button>
                        ))}
                        {categories.length === 0 && <span>No categories found</span>}
                      </div>
                      {hoveredCat?.subcategories && hoveredCat.subcategories.length > 0 && (
                        <ul className="min-w-[200px] pl-4 space-y-1">
                          {hoveredCat.subcategories.map((sub) => (
                            <li key={sub} className="capitalize">
                              <Link
                                href={`/categories/${encodeURIComponent(hoveredCat.name)}?type=${encodeURIComponent(sub)}`}
                                className="block font-medium text-gray-800 tracking-wide hover:text-primary transition-colors whitespace-nowrap truncate"
                              >
                                {sub}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </li>
          </ul>

          {!isAuthRoute && (
            <form
              onSubmit={submitSearch}
              ref={searchRef}
              className="relative flex-1 max-w-lg"
            >
              <input
                className="input input-bordered w-full pr-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for products, brands..."
              />
              <SearchIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </form>
          )}
        </div>

        <nav className="flex items-center gap-2">
          <Link href="/cart" className="relative p-2">
            <CartIcon className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                {itemCount}
              </span>
            )}
          </Link>

          <label className="swap swap-rotate">
            <input
              type="checkbox"
              aria-label="Toggle dark mode"
              checked={theme === 'dark'}
              onChange={() => setTheme?.(theme === 'dark' ? 'light' : 'dark')}
            />
            <MoonIcon className="swap-on w-5 h-5" />
            <SunIcon className="swap-off w-5 h-5" />
          </label>

          {user ? (
            <>
              <span>Hello, {user.firstName || user.email}</span>
              <button onClick={logout} className="btn btn-outline">Logout</button>
            </>
          ) : (
            !isAuthRoute && (
              <>
                <Link href="/login" className="btn btn-ghost">Login</Link>
                <Link href="/signup" className="btn btn-primary">Signup</Link>
              </>
            )
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
