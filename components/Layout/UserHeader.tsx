import Link from 'next/link';
import Image from 'next/image';
import { useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import type { FC } from 'react';
import { AppContext } from '@contexts/AppContext';
import CartIcon from '../icons/CartIcon';
import MoonIcon from '../icons/MoonIcon';
import SunIcon from '../icons/SunIcon';
import UserIcon from '../icons/UserIcon';
import MenuIcon from '../icons/MenuIcon';
import ChevronDownIcon from '../icons/ChevronDownIcon';
import ChevronRightIcon from '../icons/ChevronRightIcon';
import ElectronicsIcon from '../icons/ElectronicsIcon';
import FashionIcon from '../icons/FashionIcon';
import HomeIcon from '../icons/HomeIcon';
import ToysIcon from '../icons/ToysIcon';
import SportsIcon from '../icons/SportsIcon';
import DEFAULT_CATEGORIES from '@lib/defaultCategories';
import TrashIcon from '../icons/TrashIcon';
import SearchBar from './SearchBar';
import DropdownMenu from '@components/common/DropdownMenu';
import type { Category } from '@/types/category';
import type { User } from '@/types/user';

interface HeaderProps {
  theme?: string;
  setTheme?: React.Dispatch<React.SetStateAction<string>>;
  maxWidthClass?: string;
}

const Header: FC<HeaderProps> = ({
  theme = 'light',
  setTheme,
  maxWidthClass,
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const appContext = useContext(AppContext);

  if (!appContext) {
    throw new Error(
      'AppContext is undefined. Make sure your component is wrapped in an AppContext.Provider.'
    );
  }

  const { cart, changeQty, removeFromCart } = appContext;
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

  const closeDropdown = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  useEffect(() => {
    router.events?.on('routeChangeStart', closeDropdown);
    return () => {
      router.events?.off('routeChangeStart', closeDropdown);
    };
  }, []);

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
    const filterCats = (cats: Category[]) =>
      cats.filter(
        (c) =>
          c.name &&
          c.name.toLowerCase() !== 'uncategorized' &&
          c.name.trim() !== '1' &&
          !/^[0-9]+$/.test(c.name)
      );

    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        const catsRaw: Category[] =
          data.categories || data || DEFAULT_CATEGORIES;
        const cats = catsRaw.map((c) => ({
          ...c,
          subcategories: Array.isArray(c.subcategories)
            ? c.subcategories.map((s) =>
                typeof s === 'string' ? { name: s } : s
              )
            : undefined,
        }));
        setCategories(filterCats(cats));
      })
      .catch(() => setCategories(filterCats(DEFAULT_CATEGORIES)));
  }, []);

  useEffect(() => {
    if (menuOpen && categories.length > 0) {
      setHoveredCat(categories[0]);
    }
  }, [menuOpen, categories]);

  const itemCount = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  const logout = () => signOut({ callbackUrl: '/', redirect: true });

  const menuItems = [
    { label: 'My Orders', href: '/orders' },
    { label: 'Profile', href: '/profile' },
    { label: 'Settings', href: '/settings' },
    { label: 'Logout', onClick: logout, isButton: true },
  ];

  const iconMap: Record<string, JSX.Element> = {
    Electronics: <ElectronicsIcon className="h-5 w-5 mr-1" />,
    Fashion: <FashionIcon className="h-5 w-5 mr-1" />,
    Home: <HomeIcon className="h-5 w-5 mr-1" />,
    Toys: <ToysIcon className="h-5 w-5 mr-1" />,
    Sports: <SportsIcon className="h-5 w-5 mr-1" />,
  };

  return (
    <header className="relative bg-base-300 mb-6 py-4">
      <div
        className={`w-full px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-x-6 gap-y-2 mx-auto ${
          maxWidthClass ?? 'max-w-[95%] 2xl:max-w-[1440px]'
        }`}
      >
        <Link
          href="/"
          className="p-0 flex items-center cursor-pointer transition-transform duration-300 ease-out hover:scale-110 hover:-translate-y-1 hover:shadow-xl"
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

        <div className="flex-1 flex items-center gap-x-6 relative">
          <button
            type="button"
            aria-label="Toggle categories"
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
                  aria-label="Categories menu"
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
                  className={`absolute left-0 top-full mt-1 z-50 p-4 bg-base-100 bg-opacity-100 border border-base-200 shadow-lg rounded w-screen max-w-sm sm:max-w-xl md:max-w-3xl transition-all transform ${menuOpen ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 -translate-y-2'}`}
                  aria-hidden={!menuOpen}
                >
                  <div className="flex gap-6">
                    <div className="pr-4 border-r border-base-200 grid grid-cols-2 sm:grid-cols-3 gap-2 min-w-[220px] max-w-sm">
                      {categories.map((cat) => (
                        <Link
                          key={cat.name}
                          href={`/categories/${encodeURIComponent(cat.name)}`}
                          role="menuitem"
                          aria-haspopup={!!cat.subcategories?.length}
                          aria-expanded={hoveredCat?.name === cat.name}
                          onFocus={() => setHoveredCat(cat)}
                          onMouseEnter={() => setHoveredCat(cat)}
                          onClick={() => setMenuOpen(false)}
                          title={cat.name}
                          className="flex items-center gap-1 px-2 py-1 rounded text-left font-medium text-gray-800 tracking-wide transition-colors transition-transform duration-200 focus:outline-none capitalize whitespace-normal line-clamp-2 hover:bg-base-200 hover:text-primary hover:underline hover:scale-105 cursor-pointer"
                        >
                          {iconMap[cat.name] || null}
                          <span>{cat.name}</span>
                          {cat.subcategories?.length ? (
                            <ChevronRightIcon className="w-3 h-3 ml-auto" />
                          ) : null}
                        </Link>
                      ))}
                      {categories.length === 0 && (
                        <span>No categories found</span>
                      )}
                    </div>
                    {hoveredCat?.subcategories &&
                    hoveredCat.subcategories.length > 0 ? (
                      <ul
                        className="min-w-[200px] pl-4 space-y-1 fade-in"
                        role="menu"
                      >
                        {hoveredCat.subcategories.map((sub) => (
                          <li key={sub.name} className="capitalize" role="none">
                            <Link
                              href={`/categories/${encodeURIComponent(hoveredCat.name)}?type=${encodeURIComponent(sub.name)}`}
                              role="menuitem"
                              className="block font-medium text-gray-800 tracking-wide transition-colors transition-transform duration-200 whitespace-nowrap truncate hover:text-primary hover:underline hover:scale-105"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="min-w-[200px] pl-4 flex items-center text-sm text-gray-500">
                        No sub-categories
                      </div>
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
                  <summary
                    title={cat.name}
                    className="flex items-center gap-2 py-2 cursor-pointer list-none transition-colors transition-transform duration-200 hover:text-primary hover:underline hover:scale-105 hover:bg-base-200 rounded"
                  >
                    {iconMap[cat.name] || null}
                    <Link
                      href={`/categories/${encodeURIComponent(cat.name)}`}
                      className="capitalize line-clamp-2 whitespace-normal flex-1 cursor-pointer"
                      onClick={() => setMobileOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  </summary>
                  {cat.subcategories?.length && (
                    <ul className="pl-4 py-2 space-y-1">
                      {cat.subcategories.map((sub) => (
                        <li key={sub.name} className="capitalize">
                          <Link
                            href={`/categories/${encodeURIComponent(cat.name)}?type=${encodeURIComponent(sub.name)}`}
                            className="block py-1 transition-colors transition-transform duration-200 hover:text-primary hover:underline hover:scale-105"
                          >
                            {sub.name}
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
          <nav className="hidden lg:flex gap-6 ml-4">
            <Link
              href="/products"
              className={`transition-colors transition-transform duration-200 hover:text-primary hover:underline hover:scale-105 ${pathname.startsWith('/products') ? 'text-primary underline font-semibold' : ''}`}
            >
              Shop
            </Link>
            <Link
              href="/about"
              className={`transition-colors transition-transform duration-200 hover:text-primary hover:underline hover:scale-105 ${pathname === '/about' ? 'text-primary underline font-semibold' : ''}`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`transition-colors transition-transform duration-200 hover:text-primary hover:underline hover:scale-105 ${pathname === '/contact' ? 'text-primary underline font-semibold' : ''}`}
            >
              Contact
            </Link>
          </nav>
        </div>

        <nav className="flex items-center gap-4">
          <div className="dropdown dropdown-end dropdown-hover">
            <label
              tabIndex={0}
              aria-label="Shopping cart"
              className="p-2 cursor-pointer transition-colors transition-transform duration-200 hover:text-primary hover:scale-105"
            >
              <div className="relative flex items-center">
                <CartIcon className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 text-xs h-4 w-4 rounded-full flex items-center justify-center bg-red-500 text-white">
                    {itemCount}
                  </span>
                )}
              </div>
            </label>
            <div
              tabIndex={0}
              className="dropdown-content card card-compact w-80 sm:w-96 bg-base-100 shadow z-50"
            >
              <div className="card-body p-4">
                {cart.length === 0 ? (
                  <p className="text-sm">Your cart is empty</p>
                ) : (
                  <div className="flex flex-col h-72">
                    <ul className="flex-1 overflow-y-auto divide-y divide-base-200 text-sm space-y-1">
                      {cart.map((item) => {
                        const price = parseFloat(
                          typeof item.minPrice === 'number'
                            ? item.minPrice.toString()
                            : item.minPrice || '0'
                        );
                        return (
                          <li
                            key={item.id}
                            className="flex items-center justify-between gap-3 py-2 px-1 hover:bg-base-200 rounded"
                          >
                            <img
                              src={
                                item.featuredImage?.url || '/placeholder.png'
                              }
                              alt={item.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex flex-col flex-1 min-w-0">
                              <p
                                className="font-medium text-sm line-clamp-2 break-words"
                                title={item.title}
                              >
                                {item.title}
                              </p>
                              <p className="text-xs mt-0.5">
                                £{price.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 min-w-[80px] justify-center">
                              <button
                                type="button"
                                className="btn btn-xs"
                                onClick={() =>
                                  changeQty(
                                    item.id as string,
                                    -1,
                                    item.variant?.id
                                  )
                                }
                              >
                                -
                              </button>
                              <span className="px-1">{item.qty}</span>
                              <button
                                type="button"
                                className="btn btn-xs"
                                onClick={() =>
                                  changeQty(
                                    item.id as string,
                                    1,
                                    item.variant?.id
                                  )
                                }
                              >
                                +
                              </button>
                            </div>
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs text-error hover:text-red-600 ml-2"
                              onClick={() =>
                                removeFromCart(
                                  item.id as string,
                                  item.variant?.id
                                )
                              }
                            >
                              <TrashIcon className="w-4 h-4" />
                              <span className="sr-only">Remove</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="pt-2 mt-2 border-t">
                      <p className="font-semibold">
                        Total: £
                        {cart
                          .reduce(
                            (s, i) =>
                              s +
                              i.qty *
                                parseFloat(
                                  typeof i.minPrice === 'number'
                                    ? i.minPrice.toString()
                                    : i.minPrice || '0'
                                ),
                            0
                          )
                          .toFixed(2)}
                      </p>
                      <Link
                        href="/cart"
                        className="btn btn-primary btn-sm w-full mt-2"
                      >
                        View Cart
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

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
                {user.profileImage || user.logo ? (
                  <img
                    src={user.profileImage || user.logo}
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-5 h-5" />
                )}
                <span>
                  {user.name?.trim() ||
                    (user.firstName || user.lastName
                      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                      : user.email)}
                </span>
              </label>
              <DropdownMenu items={menuItems} onItemClick={closeDropdown} />
            </div>
          ) : (
            !isAuthRoute && (
              <>
                <Link
                  href="/login"
                  aria-label="Login"
                  className="btn btn-ghost"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  aria-label="Create an account"
                  className="btn btn-primary px-4 hover:opacity-90"
                >
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
