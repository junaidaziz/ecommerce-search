import React from 'react';
import type { Theme } from '@contexts/ThemeContext';
import type { User } from '@/types';
import { CartDropdown, UserDropdown } from '@lib/dynamicImports';
import MoonIcon from '../icons/MoonIcon';
import SunIcon from '../icons/SunIcon';

interface Props {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  user: User | undefined;
  isAuthRoute: boolean;
  menuItems: any[];
  cart: any[];
  changeQty: (id: string, delta: number, variantId?: number) => void;
  removeFromCart: (id: string, variantId?: number) => void;
  itemCount: number;
  closeDropdown: () => void;
}

const MenuItems: React.FC<Props> = ({
  theme,
  setTheme,
  user,
  isAuthRoute,
  menuItems,
  cart,
  changeQty,
  removeFromCart,
  itemCount,
  closeDropdown,
}) => (
  <nav className="flex items-center gap-4 ml-auto">
    <CartDropdown
      cart={cart}
      changeQty={changeQty}
      removeFromCart={removeFromCart}
      itemCount={itemCount}
    />
    <button
      type="button"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <SunIcon className="w-5 h-5 text-yellow-400" />
      ) : (
        <MoonIcon className="w-5 h-5 text-blue-500" />
      )}
    </button>
    <UserDropdown
      user={user}
      menuItems={menuItems}
      closeDropdown={closeDropdown}
      isAuthRoute={isAuthRoute}
    />
  </nav>
);

export default MenuItems;
