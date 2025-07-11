import Link from 'next/link';
import type { FC } from 'react';

type DropdownItem = {
  label?: string;
  href?: string;
  onClick?: () => void;
  isButton?: boolean;
  divider?: boolean;
};

interface DropdownMenuProps {
  items: DropdownItem[];
  onItemClick?: () => void;
}

const DropdownMenu: FC<DropdownMenuProps> = ({ items, onItemClick }) => {
  const handleClick = (cb?: () => void) => () => {
    cb?.();
    onItemClick?.();
  };
  return (
    <ul
      role="menu"
      tabIndex={-1}
      className="py-2 px-1 space-y-1 rounded-md shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 w-full min-w-[10rem]"
    >
      {items.map((item, index) => {
        if (item.divider) {
          return (
            <li key={index} className="py-1" role="separator">
              <hr className="border-t border-gray-200 dark:border-gray-700" />
            </li>
          );
        }
        return item.isButton ? (
          <li key={index}>
            <button
              onClick={handleClick(item.onClick)}
              className="w-full text-left px-4 py-2 rounded transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 focus:outline-none text-gray-700 dark:text-gray-200"
              role="menuitem"
            >
              {item.label}
            </button>
          </li>
        ) : (
          <li key={index}>
            <Link
              href={item.href || '#'}
              onClick={onItemClick}
              className="block px-4 py-2 rounded transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 focus:outline-none text-gray-700 dark:text-gray-200"
              role="menuitem"
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default DropdownMenu;
