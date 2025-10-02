import Link from 'next/link';
import Image from 'next/image';
import { useContext } from 'react';
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
            <div className="relative group">
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white transition-colors duration-200 cursor-pointer"
              >
                {user.logo ? (
                  <img
                    src={user.logo}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                )}
                <span className="font-medium">
                  {user.name?.trim() ||
                    (user.firstName || user.lastName
                      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                      : user.email)}
                </span>
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180 duration-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <ul className="absolute right-0 top-full mt-2 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                <li>
                  <Link
                    href="/brand/profile"
                    className="block px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-primary hover:text-white transition-all duration-200 font-medium"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/settings"
                    className="block px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-primary hover:text-white transition-all duration-200 font-medium"
                  >
                    Settings
                  </Link>
                </li>
                <li>
                  <hr className="border-gray-200 dark:border-gray-700" />
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 font-medium"
                  >
                    Logout
                  </button>
                </li>
              </ul>
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
