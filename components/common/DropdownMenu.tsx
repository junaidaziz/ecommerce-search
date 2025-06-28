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
  onItemClick?: () => void;
}

const DropdownMenu: FC<DropdownMenuProps> = ({ items, onItemClick }) => {
  const handleClick = (cb?: () => void) => () => {
    cb?.();
    onItemClick?.();
  };
  return (
    <ul
      tabIndex={0}
      className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded w-40"
    >
      {items.map((item, index) =>
        item.isButton ? (
          <li key={index}>
            <button
              onClick={handleClick(item.onClick)}
              className="transition-colors transition-transform duration-200 hover:text-primary hover:underline hover:scale-105"
            >
              {item.label}
            </button>
          </li>
        ) : (
          <li key={index}>
            <Link
              href={item.href || '#'}
              onClick={onItemClick}
              className="transition-colors transition-transform duration-200 hover:text-primary hover:underline hover:scale-105"
            >
              {item.label}
            </Link>
          </li>
        )
      )}
    </ul>
  );
};

export default DropdownMenu;
