import Link from 'next/link';
import { useContext } from 'react';
import { signOut } from 'next-auth/react';
import { AppContext } from '@contexts/AppContext';
import { useThemeContext } from '@contexts/ThemeContext';
import UserIcon from '../icons/UserIcon';
import MoonIcon from '../icons/MoonIcon';
import SunIcon from '../icons/SunIcon';
import ChevronDownIcon from '../icons/ChevronDownIcon';

export default function AdminHeader() {
  const { user } = useContext(AppContext) || {};
  const { theme, setTheme } = useThemeContext();

  const logout = () => signOut({ callbackUrl: '/', redirect: true });

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <Link href="/admin" className="text-xl font-bold text-primary">
          Admin
        </Link>
        <div className="flex items-center gap-4">
          <label
            className="swap swap-rotate btn btn-ghost btn-circle tooltip tooltip-bottom"
            data-tip={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <input
              type="checkbox"
              aria-label="Toggle dark mode"
              checked={theme === 'dark'}
              onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="sr-only"
            />
            <MoonIcon className="swap-on w-5 h-5 text-primary" />
            <SunIcon className="swap-off w-5 h-5 text-primary" />
          </label>
          {user && (
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="flex items-center gap-2 cursor-pointer">
                {user.profileImage || user.logo ? (
                  <img
                    src={user.profileImage || user.logo}
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-5 h-5" />
                )}
                <ChevronDownIcon className="w-4 h-4" />
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded w-40"
              >
                <li>
                  <button
                    onClick={logout}
                    className="transition-colors duration-200 hover:text-primary hover:underline"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
