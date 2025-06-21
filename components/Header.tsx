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

const DEFAULT_CATEGORY_TREE: Record<string, string[]> = {
  Electronics: ['Phones', 'Computers', 'Cameras'],
  Fashion: ['Men', 'Women', 'Accessories'],
  Home: ['Furniture', 'Decor', 'Kitchen'],
  Toys: ['Puzzles', 'Action Figures', 'Dolls'],
  Sports: ['Outdoor', 'Indoor', 'Fitness'],
};
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
  const isAuthRoute = [
    '/login',
    '/signup',
    '/user/signup',
    '/brand/signup',
  ].includes(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeParent, setActiveParent] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        const list = data.categories || DEFAULT_CATEGORIES;
        setCategories(list);
        if (list.length > 0 && !activeParent) {
          setActiveParent(list[0].name);
        }
      })
      .catch(() => {
        setCategories(DEFAULT_CATEGORIES);
        if (!activeParent && DEFAULT_CATEGORIES.length > 0) {
          setActiveParent(DEFAULT_CATEGORIES[0].name);
        }
      });
  }, [activeParent]);

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
        <Link href="/" className="btn btn-ghost text-xl">
          Home
        </Link>

        <div className="flex-1 flex items-center gap-x-4">
          <button
            type="button"
            className="md:hidden btn btn-ghost"
            onClick={() => setMobileMenuOpen((p) => !p)}
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          <ul
            className="menu menu-horizontal hidden md:flex"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <li className="relative">
              <button
                type="button"
                className="flex items-center gap-1"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                Categories
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <div
                id="mega-menu"
                className={`absolute left-0 top-full mt-1 z-50 bg-base-100 shadow-xl rounded w-screen max-w-3xl transition-opacity duration-200 ease-in-out ${menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onMouseEnter={() => setMenuOpen(true)}
                onMouseLeave={() => setMenuOpen(false)}
              >
                <div className="flex gap-4 px-4 py-4">
                  <ul className="w-1/3 space-y-1">
                    {categories.map((cat) => (
                      <li key={cat.name}>
                        <button
                          type="button"
                          className={`flex items-center gap-1 w-full text-left px-2 py-1 hover:bg-base-200 ${activeParent === cat.name ? 'bg-base-200 font-medium' : ''}`}
                          onMouseEnter={() => setActiveParent(cat.name)}
                        >
                          {iconMap[cat.name] || null}
                          {cat.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <ul className="flex-1 grid grid-cols-2 gap-2">
                    {(DEFAULT_CATEGORY_TREE[activeParent] || []).map((sub) => (
                      <li key={sub}>
                        <Link href="#" className="hover:text-primary">
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          </ul>

          {mobileMenuOpen && (
            <div className="absolute left-0 top-full mt-1 z-50 w-full bg-base-100 shadow-xl md:hidden">
              <ul className="menu menu-vertical p-4 gap-1">
                {categories.map((cat) => (
                  <li key={cat.name}>
                    <details>
                      <summary className="flex items-center gap-1">
                        {iconMap[cat.name] || null}
                        {cat.name}
                      </summary>
                      <ul className="pl-4">
                        {(DEFAULT_CATEGORY_TREE[cat.name] || []).map((sub) => (
                          <li key={sub}>
                            <Link href="#" className="hover:text-primary">
                              {sub}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
              checked={theme === 'dark'}
              onChange={() => setTheme?.(theme === 'dark' ? 'light' : 'dark')}
            />
            <MoonIcon className="swap-on w-5 h-5" />
            <SunIcon className="swap-off w-5 h-5" />
          </label>

          {user ? (
            <>
              <span>Hello, {user.firstName || user.email}</span>
              <button onClick={logout} className="btn btn-outline">
                Logout
              </button>
            </>
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
