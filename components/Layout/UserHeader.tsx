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
    <header className="relative bg-white dark:bg-gray-900 shadow-sm mb-6">
      <div
        className={`w-full px-4 sm:px-6 lg:px-8 mx-auto ${
          maxWidthClass ?? 'max-w-[95%] 2xl:max-w-[1440px]'
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-y-2 py-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Logo />
            <CategoryDropdown categories={categories} />
            <HeaderSearchInput categories={categories} />
          </div>
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
      </div>
    </header>
  );
};

export default Header;
