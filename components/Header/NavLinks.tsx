import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

const NavLinks: React.FC = () => {
  const { pathname } = useRouter();
  const links = [
    { href: '/products', label: 'Shop' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];
  return (
    <nav className="hidden lg:flex gap-6">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`border-b-2 border-transparent transition-colors duration-200 hover:text-primary hover:border-primary hover:scale-105 ${
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
