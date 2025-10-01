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
      className="menu p-2 space-y-1 rounded-md shadow bg-base-100 text-base-content w-full min-w-[10rem]"
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
              className="w-full text-left px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 transition-colors duration-150 hover:bg-base-200 hover:text-gray-900 dark:hover:text-white focus:bg-base-200 focus:outline-none"
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
              className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 transition-colors duration-150 hover:bg-base-200 hover:text-gray-900 dark:hover:text-white focus:bg-base-200 focus:outline-none"
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
