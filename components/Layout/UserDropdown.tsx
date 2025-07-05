import Link from 'next/link';
import UserIcon from '../icons/UserIcon';
import DropdownMenu from '../common/DropdownMenu';
import type { User } from '@/types';
import React from 'react';

interface UserDropdownProps {
  user: User | undefined;
  menuItems: any[];
  closeDropdown: () => void;
  isAuthRoute: boolean;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user, menuItems, closeDropdown, isAuthRoute }) => {
  if (user) {
    return (
      <div className="dropdown dropdown-end">
        <label
          tabIndex={0}
          className="flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
        >
          {user.profileImage || user.logo ? (
            <img
              src={user.profileImage || user.logo}
              alt="avatar"
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm uppercase">
              {user.name?.split(' ').map(n => n[0]).join('') ||
                (user.firstName || user.lastName
                  ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
                  : user.email?.[0]?.toUpperCase() || '?')}
            </span>
          )}
          <span>
            {user.name?.trim() ||
              (user.firstName || user.lastName
                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                : user.email)}
          </span>
        </label>
        <DropdownMenu items={menuItems} onItemClick={closeDropdown} />
      </div>
    );
  }
  if (!isAuthRoute) {
    return (
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
    );
  }
  return null;
};

export default UserDropdown; 