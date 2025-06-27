import Link from 'next/link';
import type { FC } from 'react';

type DropdownItem = {
  label: string;
  href?: string;
  onClick?: () => void;
  isButton?: boolean;
};

interface DropdownMenuProps {
  items: DropdownItem[];
}

const DropdownMenu: FC<DropdownMenuProps> = ({ items }) => (
  <ul
    tabIndex={0}
    className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded w-40"
  >
    {items.map((item, index) =>
      item.isButton ? (
        <li key={index}>
          <button
            onClick={item.onClick}
            className="transition-colors transition-transform duration-200 hover:text-white hover:underline hover:scale-105"
          >
            {item.label}
          </button>
        </li>
      ) : (
        <li key={index}>
          <Link
            href={item.href || '#'}
            className="transition-colors transition-transform duration-200 hover:text-white hover:underline hover:scale-105"
          >
            {item.label}
          </Link>
        </li>
      )
    )}
  </ul>
);

export default DropdownMenu;
