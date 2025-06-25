import Link from 'next/link';
import Image from 'next/image';
import { useContext } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import type { FC } from 'react';
import { AppContext } from '../contexts/AppContext';
import MoonIcon from './icons/MoonIcon';
import SunIcon from './icons/SunIcon';
import UserIcon from './icons/UserIcon';
import type { User } from '../types/user';

interface HeaderProps {
  theme?: string;
  setTheme?: React.Dispatch<React.SetStateAction<string>>;
}

const BrandHeader: FC<HeaderProps> = ({ theme = 'light', setTheme }) => {
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
      <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-x-4 gap-y-2">
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
        <nav className="flex-1 flex items-center gap-4 ml-4">
          {user && (
            <>
              <Link
                href="/brand/dashboard"
                className={`transition-colors transition-transform duration-200 hover:text-white hover:underline hover:scale-105 ${pathname === '/brand/dashboard' ? 'text-primary underline font-semibold' : ''}`}
              >
                Dashboard
              </Link>
              <Link
                href="/brand/orders"
                className={`transition-colors transition-transform duration-200 hover:text-white hover:underline hover:scale-105 ${pathname === '/brand/orders' ? 'text-primary underline font-semibold' : ''}`}
              >
                Orders
              </Link>
              <Link
                href="/brand/analytics"
                className={`transition-colors transition-transform duration-200 hover:text-white hover:underline hover:scale-105 ${pathname === '/brand/analytics' ? 'text-primary underline font-semibold' : ''}`}
              >
                Analytics
              </Link>
            </>
          )}
        </nav>
        <nav className="flex items-center gap-2">
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
                    href="/brand/profile"
                    className="transition-colors transition-transform duration-200 hover:text-white hover:underline hover:scale-105"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="transition-colors transition-transform duration-200 hover:text-white hover:underline hover:scale-105"
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

export default BrandHeader;
