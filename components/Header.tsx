import Link from 'next/link';
import Image from 'next/image';
import { useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import type { FC } from 'react';
import { AppContext } from '../contexts/AppContext';
import CartIcon from './icons/CartIcon';
import MoonIcon from './icons/MoonIcon';
import SunIcon from './icons/SunIcon';
import UserIcon from './icons/UserIcon';
import MenuIcon from './icons/MenuIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import ElectronicsIcon from './icons/ElectronicsIcon';
import FashionIcon from './icons/FashionIcon';
import HomeIcon from './icons/HomeIcon';
import ToysIcon from './icons/ToysIcon';
import SportsIcon from './icons/SportsIcon';
import DEFAULT_CATEGORIES from '../lib/defaultCategories';
import SearchBar from './SearchBar';
import type { Category } from '../types/category';
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
  const isAuthRoute = [
    '/login',
    '/signup',
    '/user/signup',
    '/brand/signup',
  ].includes(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hoveredCat, setHoveredCat] = useState<Category | null>(null);
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
      .then((data) =>
        setCategories(data.categories || data || DEFAULT_CATEGORIES)
      )
      .catch(() => setCategories(DEFAULT_CATEGORIES));
  }, []);

  useEffect(() => {
    if (menuOpen && categories.length > 0) {
      setHoveredCat(categories[0]);
    }
  }, [menuOpen, categories]);

  const itemCount = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  const logout = () => signOut({ callbackUrl: '/', redirect: true });

  const iconMap: Record<string, JSX.Element> = {
    Electronics: <ElectronicsIcon className="h-5 w-5 mr-1" />,
    Fashion: <FashionIcon className="h-5 w-5 mr-1" />,
    Home: <HomeIcon className="h-5 w-5 mr-1" />,
    Toys: <ToysIcon className="h-5 w-5 mr-1" />,
    Sports: <SportsIcon className="h-5 w-5 mr-1" />,
  };

  return (
    <header className="relative bg-base-300 mb-6 py-4">
      <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link
          href="/"
          className="p-0 flex items-center cursor-pointer transition-transform duration-300 ease-out hover:scale-105 hover:rotate-1"
        >
          <Image
            src="/images/logo-medium.png"
            alt="Logo"
            width={120}
            height={40}
            className="max-h-10 w-auto"
            priority
          />
        </Link>

        <div className="flex-1 flex items-center gap-x-4 relative">
          <button
            type="button"
            className="md:hidden btn btn-ghost"
            aria-controls="mobile-cat-menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((p) => !p)}
          >
            <span className="sr-only">Categories</span>
            <MenuIcon className="w-5 h-5" />
          </button>
          <ul className="menu menu-horizontal hidden md:flex" role="menubar">
            <li className="relative">
              <div
                onMouseEnter={handleMenuEnter}
                onMouseLeave={handleMenuLeave}
              >
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
                <div
                  id="mega-menu"
                  role="menu"
                  onMouseEnter={handleMenuEnter}
                  onMouseLeave={handleMenuLeave}
                  className={`absolute left-0 top-full mt-1 z-50 p-4 bg-base-100 bg-opacity-100 border border-base-200 shadow-lg rounded w-screen max-w-3xl transition-all transform ${menuOpen ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 -translate-y-2'}`}
                  aria-hidden={!menuOpen}
                >
                  <div className="flex gap-6">
                    <div className="w-56 pr-4 space-y-2 border-r border-base-200">
                      {categories.map((cat) => (
                        <button
                          key={cat.name}
                          type="button"
                          role="menuitem"
                          aria-haspopup={!!cat.subcategories?.length}
                          aria-expanded={hoveredCat?.name === cat.name}
                          onFocus={() => setHoveredCat(cat)}
                          onMouseEnter={() => setHoveredCat(cat)}
                          className="w-full flex items-center gap-1 text-left font-medium text-gray-800 tracking-wide hover:text-accent transition-colors duration-200 focus:outline-none capitalize whitespace-nowrap truncate"
                        >
                          {iconMap[cat.name] || null}
                          {cat.name}
                          {cat.subcategories?.length ? (
                            <ChevronDownIcon
                              className={`w-3 h-3 ml-auto transition-transform ${hoveredCat?.name === cat.name ? 'rotate-180' : ''}`}
                            />
                          ) : null}
                        </button>
                      ))}
                      {categories.length === 0 && (
                        <span>No categories found</span>
                      )}
                    </div>
                    {hoveredCat?.subcategories &&
                      hoveredCat.subcategories.length > 0 && (
                        <ul
                          className="min-w-[200px] pl-4 space-y-1"
                          role="menu"
                        >
                          {hoveredCat.subcategories.map((sub) => (
                            <li key={sub} className="capitalize" role="none">
                              <Link
                                href={`/categories/${encodeURIComponent(hoveredCat.name)}?type=${encodeURIComponent(sub)}`}
                                role="menuitem"
                                className="block font-medium text-gray-800 tracking-wide hover:text-accent transition-colors duration-200 whitespace-nowrap truncate"
                              >
                                {sub}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                </div>
              </div>
            </li>
          </ul>
          <div
            id="mobile-cat-menu"
            className={`md:hidden absolute left-0 top-full w-full z-40 bg-base-100 border border-base-200 shadow-lg rounded p-4 transition-all ${mobileOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
          >
            <ul className="space-y-2">
              {categories.map((cat) => (
                <details
                  key={cat.name}
                  className="border-b border-base-200 last:border-none"
                >
                  <summary className="flex items-center gap-2 py-2 cursor-pointer list-none transition-colors duration-200 hover:text-accent">
                    {iconMap[cat.name] || null}
                    <span className="capitalize">{cat.name}</span>
                  </summary>
                  {cat.subcategories?.length && (
                    <ul className="pl-4 py-2 space-y-1">
                      {cat.subcategories.map((sub) => (
                        <li key={sub} className="capitalize">
                          <Link
                            href={`/categories/${encodeURIComponent(cat.name)}?type=${encodeURIComponent(sub)}`}
                            className="block py-1 transition-colors duration-200 hover:text-accent hover:underline"
                          >
                            {sub}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </details>
              ))}
              {categories.length === 0 && <li>No categories found</li>}
            </ul>
          </div>

          {!isAuthRoute && (
            <SearchBar placeholder="Search for products, brands..." />
          )}
          <nav className="hidden lg:flex gap-4 ml-4">
            <Link
              href="/products"
              className={`transition-colors duration-200 hover:text-accent hover:underline ${pathname.startsWith('/products') ? 'text-accent underline font-semibold' : ''}`}
            >
              Shop
            </Link>
            <Link
              href="/about"
              className={`transition-colors duration-200 hover:text-accent hover:underline ${pathname === '/about' ? 'text-accent underline font-semibold' : ''}`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`transition-colors duration-200 hover:text-accent hover:underline ${pathname === '/contact' ? 'text-accent underline font-semibold' : ''}`}
            >
              Contact
            </Link>
          </nav>
        </div>

        <nav className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative p-2 transition-colors duration-200 hover:text-accent"
          >
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
            <div className="dropdown dropdown-end">
              <label
                tabIndex={0}
                className="flex items-center gap-2 cursor-pointer"
              >
                {user.logo ? (
                  <img
                    src={user.logo}
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-5 h-5" />
                )}
                <span>
                  {user.firstName || user.lastName
                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                    : user.email}
                </span>
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded w-40"
              >
                <li>
                  <Link
                    href="/orders"
                    className="transition-colors duration-200 hover:text-accent"
                  >
                    My Orders
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className="transition-colors duration-200 hover:text-accent"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile/edit"
                    className="transition-colors duration-200 hover:text-accent"
                  >
                    Update Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/settings"
                    className="transition-colors duration-200 hover:text-accent"
                  >
                    Settings
                  </Link>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="transition-colors duration-200 hover:text-accent"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            !isAuthRoute && (
              <>
                <Link href="/login" className="btn btn-ghost">
                  Login
                </Link>
                <Link href="/signup" className="btn btn-primary">
                  Signup
                </Link>
              </>
            )
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
