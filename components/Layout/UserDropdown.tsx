import Link from 'next/link';
import UserIcon from '../icons/UserIcon';
import DropdownMenu from '../common/DropdownMenu';
import type { User } from '@/types';
import React, { useRef, useState, useEffect } from 'react';

interface UserDropdownProps {
  user: User | undefined;
  menuItems: any[];
  closeDropdown: () => void;
  isAuthRoute: boolean;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user, menuItems, closeDropdown, isAuthRoute }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none"
          onClick={() => setOpen((v) => !v)}
        >
          {user.profileImage || user.logo ? (
            <img
              src={user.profileImage || user.logo}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
            />
          ) : (
            <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm uppercase">
              {user.name?.split(' ').map((n: string) => n[0]).join('') ||
                (user.firstName || user.lastName
                  ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
                  : user.email?.[0]?.toUpperCase() || '?')}
            </span>
          )}
          <span className="hidden md:inline font-medium text-gray-700 dark:text-gray-200">
            {user.name?.trim() ||
              (user.firstName || user.lastName
                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                : user.email)}
          </span>
          <svg className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-2 z-50">
            <DropdownMenu
              items={menuItems}
              onItemClick={() => {
                setOpen(false);
                closeDropdown();
              }}
            />
          </div>
        )}
      </div>
    );
  }
  if (!isAuthRoute) {
    return (
      <div className="flex items-center space-x-2">
        <Link
          href="/login"
          aria-label="Login"
          className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
        >
          Login
        </Link>
        <Link
          href="/signup"
          aria-label="Create an account"
          className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          Signup
        </Link>
      </div>
    );
  }
  return null;
};

export default UserDropdown; 