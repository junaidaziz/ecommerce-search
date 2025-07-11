import { apiFetch } from '@lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import type { FC } from 'react';
import { AppContext } from '@contexts/AppContext';
import MoonIcon from '../icons/MoonIcon';
import SunIcon from '../icons/SunIcon';
import DEFAULT_CATEGORIES from '@lib/defaultCategories';
import type { Category } from '@/types';
import type { User } from '@/types';
import { USER_ROLES } from '@/types';
import { 
  CartDropdown,
  CategoryMenu,
  UserDropdown,
  SearchBar
} from '@lib/dynamicImports';
import type { Theme } from '@contexts/ThemeContext';

interface HeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  maxWidthClass?: string;
}

const Header: FC<HeaderProps> = ({
  theme,
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
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const filterCats = (cats: Category[]) =>
      cats.filter(
        (c) =>
          typeof c.name === 'string' &&
          c.name.toLowerCase() !== 'uncategorized' &&
          c.name.trim() !== '1' &&
          !/^[0-9]+$/.test(c.name)
      );

    apiFetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        const catsRaw: Category[] =
          data.categories || data || DEFAULT_CATEGORIES;
        const cats = catsRaw.map((c) => ({
          ...c,
          subcategories: Array.isArray(c.subcategories)
            ? c.subcategories
                .map((s) => {
                  if (typeof s === 'string') {
                    return {
                      name: s,
                      slug: (s as string).toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^a-z0-9\-]/g, ''),
                    };
                  } else if (typeof s === 'object' && s && typeof s.name === 'string') {
                    return {
                      ...s,
                      slug:
                        s.slug ||
                        s.name.toLowerCase()
                          .replace(/\s+/g, '-')
                          .replace(/[^a-z0-9\-]/g, ''),
                    };
                  }
                  return { name: '', slug: '' };
                })
                .filter((s) => !!s.name && !!s.slug)
            : undefined,
        }));
        setCategories(filterCats(cats as Category[]));
      })
      .catch(() => setCategories(filterCats(DEFAULT_CATEGORIES)));
  }, []);

  const itemCount = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  const logout = () => signOut({ callbackUrl: '/', redirect: true });

  const isSuperAdmin = user?.role === USER_ROLES.SUPER_ADMIN;

  const menuItems = [
    ...(isSuperAdmin
      ? [
          { label: 'Admin Dashboard', href: '/admin' },
          { label: 'All Users', href: '/admin/users' },
          { label: 'All Brands', href: '/admin/brands' },
          { label: 'All Products', href: '/admin/products' },
          { label: 'All Orders', href: '/admin/orders' },
          { divider: true },
        ]
      : [
          { label: 'My Orders', href: '/orders' },
          { label: 'Profile', href: '/profile' },
          { label: 'Reviews', href: '/user/reviews' },
          { label: 'Coupons', href: '/user/coupons' },
          { label: 'Credit', href: '/user/credit' },
          { label: 'Stores', href: '/user/stores' },
          { label: 'History', href: '/user/history' },
          { label: 'Notifications', href: '/user/notifications' },
          { label: 'Permissions', href: '/user/permissions' },
          { label: 'Settings', href: '/settings' },
        ]),
    { label: 'Logout', onClick: logout, isButton: true },
  ];

  const closeDropdown = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  return (
    <header className="relative bg-white dark:bg-gray-900 shadow-sm mb-6 py-4">
      <div
        className={`w-full px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-x-6 gap-y-2 mx-auto ${
          maxWidthClass ?? 'max-w-[95%] 2xl:max-w-[1440px]'
        }`}
      >
        <Link
          href="/admin"
          className="p-0 flex items-center cursor-pointer transition-transform duration-300 ease-out hover:scale-110 hover:-translate-y-1"
        >
          <Image
            src="/images/logo-medium.png"
            alt="Logo"
            width={120}
            height={40}
            className="max-h-10 h-auto w-auto"
            priority
          />
        </Link>

        <div className="flex-1 flex items-center gap-x-6 relative">
          {/* No search bar or category menu for super admin */}
          <nav className="hidden lg:flex gap-6 ml-4">
            <Link
              href="/products"
              className={`border-b-2 border-transparent transition-colors duration-200 hover:text-primary hover:border-primary hover:scale-105 ${pathname.startsWith('/products') ? 'font-semibold text-primary border-primary' : ''}`}
            >
              Shop
            </Link>
            <Link
              href="/about"
              className={`border-b-2 border-transparent transition-colors duration-200 hover:text-primary hover:border-primary hover:scale-105 ${pathname === '/about' ? 'font-semibold text-primary border-primary' : ''}`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`border-b-2 border-transparent transition-colors duration-200 hover:text-primary hover:border-primary hover:scale-105 ${pathname === '/contact' ? 'font-semibold text-primary border-primary' : ''}`}
            >
              Contact
            </Link>
          </nav>
        </div>

        <nav className="flex items-center gap-4">
          {/* Theme toggle */}
          <button
            type="button"
            aria-label="Toggle dark mode"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <SunIcon className="w-5 h-5 text-yellow-400" />
            ) : (
              <MoonIcon className="w-5 h-5 text-blue-500" />
            )}
          </button>

          {/* User dropdown */}
          <UserDropdown user={user} menuItems={menuItems} closeDropdown={closeDropdown} isAuthRoute={isAuthRoute} />
        </nav>
      </div>
    </header>
  );
};

export default Header;
