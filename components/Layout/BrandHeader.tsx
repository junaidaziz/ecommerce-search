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
import type { User } from '@/types/user';

interface HeaderProps {
  theme?: string;
  setTheme?: React.Dispatch<React.SetStateAction<string>>;
  maxWidthClass?: string;
}

const BrandHeader: FC<HeaderProps> = ({
  theme = 'light',
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
        <nav className="flex-1 flex items-center gap-6 ml-4">
          {user && (
            <>
              <Link
                href="/brand/dashboard"
                className={`border-b-2 border-transparent transition-colors transition-transform duration-200 hover:text-primary/80 hover:border-primary hover:scale-105 ${pathname === '/brand/dashboard' ? 'font-semibold text-primary border-primary' : ''}`}
              >
                Dashboard
              </Link>
              <Link
                href="/brand/orders"
                className={`border-b-2 border-transparent transition-colors transition-transform duration-200 hover:text-primary/80 hover:border-primary hover:scale-105 ${pathname === '/brand/orders' ? 'font-semibold text-primary border-primary' : ''}`}
              >
                Orders
              </Link>
              <Link
                href="/brand/analytics"
                className={`border-b-2 border-transparent transition-colors transition-transform duration-200 hover:text-primary/80 hover:border-primary hover:scale-105 ${pathname === '/brand/analytics' ? 'font-semibold text-primary border-primary' : ''}`}
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
                className="btn btn-primary btn-sm"
              >
                + Add Product
              </Link>
              <Link
                href="/brand/orders"
                title="View orders"
                className={`btn btn-sm ${pathname.startsWith('/brand/orders') ? 'btn-primary' : ''}`}
              >
                🧾 View Orders
              </Link>
              <Link
                href="/brand/analytics"
                title="Open analytics"
                className={`btn btn-sm ${pathname.startsWith('/brand/analytics') ? 'btn-primary' : ''}`}
              >
                📈 Open Analytics
              </Link>
            </div>
          )}
          <NotificationBell />
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
                  {user.name?.trim() ||
                    (user.firstName || user.lastName
                      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                      : user.email)}
                </span>
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded w-40"
              >
                <li>
                  <Link
                    href="/brand/profile"
                    className="transition-colors transition-transform duration-200 hover:text-primary hover:underline hover:scale-105"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="transition-colors transition-transform duration-200 hover:text-primary hover:underline hover:scale-105"
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

export default BrandHeader;
