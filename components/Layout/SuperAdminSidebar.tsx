import Link from 'next/link';
import { useRouter } from 'next/router';
import { HiOutlineSquares2X2, HiOutlineUsers, HiOutlineBuildingStorefront, HiOutlineCube, HiOutlineClipboard, HiOutlineChartBar, HiOutlineTag, HiOutlineQuestionMarkCircle } from 'react-icons/hi2';

const links = [
  { href: '/admin', label: 'Dashboard', icon: HiOutlineSquares2X2 },
  { href: '/admin/users', label: 'Users', icon: HiOutlineUsers },
  { href: '/admin/brands', label: 'Brands', icon: HiOutlineBuildingStorefront },
  { href: '/admin/products', label: 'Products', icon: HiOutlineCube },
  { href: '/admin/orders', label: 'Orders', icon: HiOutlineClipboard },
  { href: '/admin/analytics', label: 'Analytics', icon: HiOutlineChartBar },
  { href: '/admin/categories', label: 'Categories', icon: HiOutlineTag },
  { href: '/admin/support', label: 'Support', icon: HiOutlineQuestionMarkCircle },
];

const SuperAdminSidebar: React.FC = () => {
  const router = useRouter();
  const active = router.pathname;
  return (
    <aside className="hidden md:flex md:flex-col sticky top-0 h-screen w-60 bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800 py-8 px-4 flex-shrink-0 shadow-sm z-30">
      <div className="mb-8 text-center">
        <span className="text-xl font-bold tracking-tight text-primary">Super Admin</span>
      </div>
      <nav className="flex-1">
        <ul className="flex flex-col gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = active === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors duration-150 group
                    ${isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary'}
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary dark:group-hover:text-primary'}`} />
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default SuperAdminSidebar; 