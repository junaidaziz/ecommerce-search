import Link from 'next/link';
import { useContext, useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { AppContext } from '@contexts/AppContext';
import { useThemeContext } from '@contexts/ThemeContext';
import UserIcon from '../icons/UserIcon';
import MoonIcon from '../icons/MoonIcon';
import SunIcon from '../icons/SunIcon';
import ChevronDownIcon from '../icons/ChevronDownIcon';
import BellIcon from '../icons/BellIcon';
import CogIcon from '../icons/CogIcon';
import MenuIcon from '../icons/MenuIcon';
import { USER_ROLES } from '@/types';

export default function AdminHeader() {
  const { user } = useContext(AppContext) || {};
  const { theme, setTheme } = useThemeContext();
  const router = useRouter();

  // Dropdown state
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or ESC
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(e.target as Node)
      ) {
        setNotifDropdownOpen(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setUserDropdownOpen(false);
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const logout = () => signOut({ callbackUrl: '/', redirect: true });

  // Get current page title for breadcrumb
  const getPageTitle = () => {
    const path = router.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path === '/admin/users') return 'User Management';
    if (path === '/admin/brands') return 'Brand Management';
    if (path === '/admin/products') return 'Product Management';
    if (path === '/admin/orders') return 'Order Management';
    if (path === '/admin/analytics') return 'Analytics';
    if (path === '/admin/categories') return 'Category Management';
    if (path === '/admin/support') return 'Support Tickets';
    if (path === '/admin/coupons') return 'Coupon Management';
    if (path === '/admin/policies') return 'Policy Management';
    if (path === '/admin/search-analytics') return 'Search Analytics';
    if (path === '/admin/approvals') return 'Vendor Approvals';
    return 'Admin Panel';
  };

  const isSuperAdmin = user?.role?.toUpperCase() === USER_ROLES.SUPER_ADMIN;

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 border-b border-blue-900 dark:border-gray-800 shadow-md transition-colors duration-300">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Left side - Logo and Breadcrumb */}
        <div className="flex items-center gap-4">
          <Link 
            href="/admin" 
            className="flex items-center gap-2 text-xl font-bold text-white hover:text-primary-200 transition-colors duration-200"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="hidden sm:inline">Admin Panel</span>
          </Link>
          {/* Breadcrumb */}
          <div className="hidden md:flex items-center gap-2 text-sm text-blue-200 dark:text-blue-300">
            <span>/</span>
            <span className="font-medium text-white dark:text-blue-100">{getPageTitle()}</span>
          </div>
        </div>

        {/* Center - Quick Stats (for dashboard) */}
        {router.pathname === '/admin' && (
          <div className="hidden lg:flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-blue-100 dark:text-blue-300">System Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-blue-100 dark:text-blue-300">All Services Active</span>
            </div>
          </div>
        )}

        {/* Right side - Actions and User */}
        <div className="flex items-center gap-3">
          {/* Quick Actions */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Notification Dropdown */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                className="p-2 rounded-full text-blue-100 hover:bg-blue-800/60 focus:bg-blue-800/80 focus:outline-none transition flex items-center justify-center"
                title="Notifications"
                aria-label="Notifications"
                onClick={() => setNotifDropdownOpen((open) => !open)}
                tabIndex={0}
              >
                <BellIcon className="w-6 h-6" />
              </button>
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded-xl shadow-2xl z-50 p-4">
                  <div className="text-sm text-blue-900 dark:text-blue-100 font-semibold mb-2">Notifications</div>
                  <div className="text-blue-500 dark:text-blue-300 text-sm">No new notifications.</div>
                </div>
              )}
            </div>
            {/* Theme Toggle */}
            <button
              type="button"
              aria-label="Toggle dark mode"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full text-blue-100 hover:bg-blue-800/60 focus:bg-blue-800/80 focus:outline-none transition flex items-center justify-center"
              data-tip={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <SunIcon className="w-6 h-6 text-yellow-300" />
              ) : (
                <MoonIcon className="w-6 h-6 text-blue-300" />
              )}
            </button>

            {/* User Dropdown */}
            {user && (
              <div className="relative" ref={userDropdownRef}>
                <button
                  className="flex items-center gap-2 cursor-pointer hover:bg-blue-800/60 focus:bg-blue-800/80 rounded-lg px-2 py-1 transition-colors duration-200 text-white"
                  onClick={() => setUserDropdownOpen((open) => !open)}
                  aria-label="User menu"
                  tabIndex={0}
                >
                  <div className="flex items-center gap-2">
                    {user.profileImage || user.logo ? (
                      <img
                        src={user.profileImage || user.logo}
                        alt="avatar"
                        className="w-8 h-8 rounded-full object-cover border-2 border-blue-200 dark:border-blue-800"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-white dark:text-blue-100">
                        {user.email}
                      </div>
                      <div className="text-xs font-semibold text-primary-200 dark:text-blue-300">
                        {isSuperAdmin ? 'Super Admin' : 'Administrator'}
                      </div>
                    </div>
                  </div>
                  <ChevronDownIcon className="w-5 h-5 text-blue-200" />
                </button>
                {userDropdownOpen && (
                  <ul
                    className="absolute right-0 mt-2 z-50 menu p-2 shadow-2xl bg-white dark:bg-gray-900 rounded-xl border border-blue-200 dark:border-blue-800 w-56"
                  >
                    <li className="px-3 py-2 border-b border-blue-100 dark:border-blue-800">
                      <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {user.email}
                      </div>
                      <div className="text-xs font-semibold text-primary dark:text-blue-300">
                        {isSuperAdmin ? 'Super Administrator' : 'Administrator'}
                      </div>
                    </li>
                    <li>
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-900 dark:text-blue-100 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-md transition-colors duration-200"
                      >
                        <CogIcon className="w-6 h-6" />
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin/users"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-900 dark:text-blue-100 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-md transition-colors duration-200"
                      >
                        <UserIcon className="w-6 h-6" />
                        Manage Users
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin/support"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-900 dark:text-blue-100 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-md transition-colors duration-200"
                      >
                        <BellIcon className="w-6 h-6" />
                        Support Tickets
                      </Link>
                    </li>
                    <li className="border-t border-blue-100 dark:border-blue-800 mt-1 pt-1">
                      <button
                        onClick={logout}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200 w-full text-left"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
