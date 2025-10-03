import Link from 'next/link';
import Image from 'next/image';
import { useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import type { FC } from 'react';
import { AppContext } from '@contexts/AppContext';
import MoonIcon from '../icons/MoonIcon';
import SunIcon from '../icons/SunIcon';
import UserIcon from '../icons/UserIcon';
import NotificationBell from './NotificationBell';
import type { User } from '@/types';
import type { Theme } from '@contexts/ThemeContext';

interface HeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  maxWidthClass?: string;
}

const BrandHeader: FC<HeaderProps> = ({
  theme,
  setTheme,
  maxWidthClass,
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const appContext = useContext(AppContext);
  const user = session?.user as User | undefined;
  const pathname = router.pathname;
  const isAuthRoute = [
    '/login',
    '/signup',
    '/user/signup',
    '/brand/signup',
  ].includes(pathname);

  const logout = () => signOut({ callbackUrl: '/', redirect: true });

  // User menu state (replaces purely hover-based approach for accessibility & mobile friendliness)
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const userMenuRef = useRef<HTMLUListElement | null>(null);

  const closeMenu = useCallback(() => setUserMenuOpen(false), []);
  const toggleMenu = useCallback(() => setUserMenuOpen(o => !o), []);

  // Close on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node) &&
        userMenuButtonRef.current &&
        !userMenuButtonRef.current.contains(e.target as Node)
      ) {
        closeMenu();
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeMenu();
    }
    window.addEventListener('mousedown', onClickOutside);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onClickOutside);
      window.removeEventListener('keydown', onKey);
    };
  }, [userMenuOpen, closeMenu]);

  // Simple deterministic color ring variant based on email hash (for variety) – fallback to gradient
  const avatarRingClass = (() => {
    if (!user?.email) return 'ring-primary/40';
    const code = user.email
      .split('')
      .reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
    const variants = [
      'ring-indigo-400/50 dark:ring-indigo-500/40',
      'ring-emerald-400/50 dark:ring-emerald-500/40',
      'ring-fuchsia-400/50 dark:ring-fuchsia-500/40',
      'ring-amber-400/50 dark:ring-amber-500/40',
      'ring-cyan-400/50 dark:ring-cyan-500/40',
    ];
    return variants[code % variants.length];
  })();

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-950/95 shadow-sm border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm transition-colors duration-300">
      <div
        className={`w-full px-4 sm:px-6 lg:px-8 mx-auto ${maxWidthClass || 'max-w-10xl'}`}
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 min-h-20 py-4">
        <Link
          href="/"
          className="p-0 flex items-center cursor-pointer transition-transform duration-300 ease-out hover:scale-110 hover:-translate-y-1 hover:shadow-xl"
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
        <nav className="flex-1 flex items-center gap-6 ml-4">
          {user && (
            <>
              <Link
                href="/brand/dashboard"
                className={`border-b-2 border-transparent transition-colors transition-transform duration-200 text-gray-700 dark:text-gray-300 hover:text-primary hover:border-primary hover:scale-105 ${pathname === '/brand/dashboard' ? 'font-semibold text-primary border-primary' : ''}`}
              >
                Dashboard
              </Link>
              <Link
                href="/brand/products"
                className={`border-b-2 border-transparent transition-colors transition-transform duration-200 text-gray-700 dark:text-gray-300 hover:text-primary hover:border-primary hover:scale-105 ${pathname.startsWith('/brand/products') ? 'font-semibold text-primary border-primary' : ''}`}
              >
                Products
              </Link>
              <Link
                href="/brand/orders"
                className={`border-b-2 border-transparent transition-colors transition-transform duration-200 text-gray-700 dark:text-gray-300 hover:text-primary hover:border-primary hover:scale-105 ${pathname === '/brand/orders' ? 'font-semibold text-primary border-primary' : ''}`}
              >
                Orders
              </Link>
              <Link
                href="/brand/analytics"
                className={`border-b-2 border-transparent transition-colors transition-transform duration-200 text-gray-700 dark:text-gray-300 hover:text-primary hover:border-primary hover:scale-105 ${pathname === '/brand/analytics' ? 'font-semibold text-primary border-primary' : ''}`}
              >
                Analytics
              </Link>
            </>
          )}
        </nav>
        <nav className="flex items-center gap-4">
          {user && (
            <div className="flex flex-wrap gap-2 mr-2">
              <Link
                href="/brand/products/new"
                title="Add a new product"
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                + Add Product
              </Link>
              <Link
                href="/brand/orders"
                title="View orders"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md ${
                  pathname.startsWith('/brand/orders')
                    ? 'text-white bg-primary'
                    : 'text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                🧾 View Orders
              </Link>
              <Link
                href="/brand/analytics"
                title="Open analytics"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md ${
                  pathname.startsWith('/brand/analytics')
                    ? 'text-white bg-primary'
                    : 'text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                📈 Open Analytics
              </Link>
            </div>
          )}
          <NotificationBell />
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Toggle dark mode"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <SunIcon className="w-5 h-5 text-primary" />
            ) : (
              <MoonIcon className="w-5 h-5 text-primary" />
            )}
          </button>
          {user ? (
            <div className="relative">
              <button
                ref={userMenuButtonRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                onClick={toggleMenu}
                className="group flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full bg-gray-50/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <div className={`relative w-9 h-9 shrink-0 rounded-full ring-2 ${avatarRingClass} overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white`}
                     aria-label="User avatar">
                  {user.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.logo}
                      alt="User avatar"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="font-semibold text-sm select-none">
                      {(user.firstName?.[0] || user.name?.[0] || user.email?.[0] || '?').toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 max-w-[110px] truncate">
                    {user.name?.trim() ||
                      (user.firstName || user.lastName
                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                        : user.email)}
                  </span>
                  <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">
                    Brand
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {userMenuOpen && (
                <ul
                  ref={userMenuRef}
                  role="menu"
                  className="absolute right-0 mt-2 w-64 origin-top-right animate-scale-fade bg-white/90 dark:bg-gray-900/90 backdrop-blur-md ring-1 ring-black/[0.05] dark:ring-white/[0.08] border border-gray-200/70 dark:border-gray-700/60 rounded-2xl shadow-2xl p-1.5 flex flex-col gap-0.5 z-50"
                >
                  <li className="px-3 pt-2 pb-3 border-b border-gray-200/70 dark:border-gray-700/60">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ring-2 ${avatarRingClass} overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white`}
                           aria-hidden="true">
                        {user.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.logo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-semibold text-sm">
                            {(user.firstName?.[0] || user.name?.[0] || user.email?.[0] || '?').toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                          {user.name?.trim() ||
                            (user.firstName || user.lastName
                              ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                              : user.email)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <Link
                      role="menuitem"
                      href="/brand/profile"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors"
                      onClick={closeMenu}
                    >
                      <span>Profile</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      role="menuitem"
                      href="/settings"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors"
                      onClick={closeMenu}
                    >
                      <span>Settings</span>
                    </Link>
                  </li>
                  <li className="mt-1 pt-1 border-t border-gray-200/70 dark:border-gray-700/60" />
                  <li>
                    <button
                      role="menuitem"
                      onClick={() => {
                        closeMenu();
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-900/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 transition-colors"
                    >
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            !isAuthRoute && (
              <>
                <Link
                  href="/login"
                  aria-label="Login"
                  className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  aria-label="Create an account"
                  className="px-4 py-2 text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  Signup
                </Link>
              </>
            )
          )}
        </nav>
        </div>
      </div>
    </header>
  );
};

export default BrandHeader;
