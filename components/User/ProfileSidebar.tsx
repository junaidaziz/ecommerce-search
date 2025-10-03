import Link from 'next/link';

interface ProfileSidebarProps {
  active: string;
}

const links = [
  { href: '/user/profile', label: 'Profile' },
  { href: '/user/orders', label: 'Orders' },
  { href: '/user/wishlist', label: 'Wishlist' },
  { href: '/user/reviews', label: 'Your Reviews' },
  { href: '/user/coupons', label: 'Coupons & Offers' },
  { href: '/user/credit', label: 'Credit Balance' },
  { href: '/user/stores', label: 'Followed Stores' },
  { href: '/user/history', label: 'Browsing History' },
  { href: '/user/notifications', label: 'Notifications' },
  { href: '/user/security', label: 'Security' },
  { href: '/user/permissions', label: 'Permissions' },
];

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ active }) => {
  const linkClass = (href: string) =>
    `block px-2 py-2 rounded transition-colors hover:bg-base-200 ${
      active === href ? 'text-primary underline font-semibold' : ''
    }`;
  return (
    <aside className="md:w-48 w-full">
      <ul className="menu menu-vertical bg-base-100 rounded-box p-2 space-y-1">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default ProfileSidebar;
