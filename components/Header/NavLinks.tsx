import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

interface NavLinksProps {
  onLinkClick?: () => void;
}

const NavLinks: React.FC<NavLinksProps> = ({ onLinkClick }) => {
  const { pathname } = useRouter();
  const links = [
    { href: '/products', label: 'Shop' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];
  return (
    <nav className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          onClick={onLinkClick}
          className={`text-gray-700 dark:text-gray-300 border-b-2 border-transparent transition-colors duration-200 hover:text-primary hover:border-primary hover:scale-105 ${
            (href === '/products' && pathname.startsWith('/products')) || pathname === href
              ? 'font-semibold text-primary border-primary'
              : ''
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
};

export default NavLinks;
