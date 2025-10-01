import { apiFetch } from '@lib/api';
import { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import type { FC } from 'react';
import { AppContext } from '@contexts/AppContext';
import DEFAULT_CATEGORIES from '@lib/defaultCategories';
import type { Category } from '@/types';
import type { User } from '@/types';
import { USER_ROLES } from '@/types';
import Logo from '../Header/Logo';
import CategoryDropdown from '../Header/CategoryDropdown';
import HeaderSearchInput from '../Header/SearchInput';
import MenuItems from '../Header/MenuItems';
import NavLinks from '../Header/NavLinks';
import type { Theme } from '@contexts/ThemeContext';

interface HeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  maxWidthClass?: string;
}

const Header: FC<HeaderProps> = ({ theme, setTheme, maxWidthClass }) => {
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                      slug: (s as string)
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^a-z0-9\-]/g, ''),
                    };
                  } else if (
                    typeof s === 'object' &&
                    s &&
                    typeof s.name === 'string'
                  ) {
                    return {
                      ...s,
                      slug:
                        s.slug ||
                        s.name
                          .toLowerCase()
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
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-950/95 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div
        className={`w-full px-2 sm:px-4 lg:px-8 mx-auto ${maxWidthClass || 'max-w-screen-2xl'}`}
      >
        <div className="flex items-center justify-between h-20">
          {/* Left: Logo */}
          <div className="flex items-center gap-8 min-w-0">
            <Logo />
            {/* Categories with spacing from logo */}
            <div className="hidden lg:block">
              <CategoryDropdown categories={categories} />
            </div>
          </div>
          {/* Center: Search with increased width (desktop) */}
          <div className="hidden lg:flex flex-1 items-center justify-center max-w-3xl mx-auto">
              {/* Search input with increased width and modern style */}
              <HeaderSearchInput categories={categories} className="w-full max-w-3xl" />
          </div>
          {/* Right: NavLinks + Cart, Theme, User, Auth (desktop) */}
          <div className="hidden lg:flex items-center gap-6 ml-auto">
            <NavLinks />
            {/* Cart icon with badge, grouped with theme and auth */}
            <div className="flex items-center gap-2">
              <MenuItems
                theme={theme}
                setTheme={setTheme}
                user={user}
                isAuthRoute={isAuthRoute}
                menuItems={menuItems}
                cart={cart}
                changeQty={changeQty}
                removeFromCart={removeFromCart}
                itemCount={itemCount}
                closeDropdown={closeDropdown}
              />
            </div>
          </div>
          {/* Mobile: Hamburger */}
          <div className="lg:hidden flex items-center ml-auto">
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              aria-label="Open main menu"
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 rounded-xl bg-gray-100 dark:bg-gray-800 shadow-lg p-4 flex flex-col gap-4 animate-fade-in">
            <CategoryDropdown categories={categories} />
            <HeaderSearchInput categories={categories} />

            <NavLinks />
            <MenuItems
              theme={theme}
              setTheme={setTheme}
              user={user}
              isAuthRoute={isAuthRoute}
              menuItems={menuItems}
              cart={cart}
              changeQty={changeQty}
              removeFromCart={removeFromCart}
              itemCount={itemCount}
              closeDropdown={closeDropdown}
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
