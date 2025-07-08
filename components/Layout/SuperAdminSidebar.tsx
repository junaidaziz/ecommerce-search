import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/brands', label: 'Brands' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/support', label: 'Support' },
];

const SuperAdminSidebar: React.FC = () => {
  const router = useRouter();
  const active = router.pathname;
  return (
    <aside className="w-full md:w-56 bg-white border-r border-gray-100 min-h-screen py-8 px-4 flex-shrink-0 flex flex-col items-center">
      {/* Logo removed for cleaner UI, logo remains in header */}
      <nav className="w-full mt-4">
        <ul className="flex flex-col gap-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block px-4 py-2 rounded-lg font-medium transition-colors duration-150
                  ${active === link.href
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-700 hover:bg-primary/10 hover:text-primary'}
                `}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default SuperAdminSidebar; 