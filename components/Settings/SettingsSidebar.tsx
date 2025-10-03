import { KeyIcon, HomeIcon, EnvelopeIcon, CreditCardIcon, TagIcon, UserIcon, BuildingStorefrontIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface SettingsSidebarProps {
  active: 'profile' | 'password' | 'address' | 'email' | 'payments' | 'coupons' | 'brand' | 'security';
  onSelect: (tab: SettingsSidebarProps['active']) => void;
  userRole?: string;
}

const tabIcons = {
  profile: UserIcon,
  password: KeyIcon,
  address: HomeIcon,
  email: EnvelopeIcon,
  payments: CreditCardIcon,
  coupons: TagIcon,
  brand: BuildingStorefrontIcon,
  security: ShieldCheckIcon,
};

const tabLabels = {
  profile: 'Update Profile',
  password: 'Change Password',
  address: 'Manage Address',
  email: 'Change Email',
  payments: 'Payment Methods',
  coupons: 'Coupons & Offers',
  brand: 'Brand Settings',
  security: 'Account Security',
};

const tabOrder = [
  'profile',
  'brand',
  'password',
  'security',
  'address',
  'email',
  'payments',
  'coupons',
];

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  active,
  onSelect,
  userRole,
}) => {
  return (
    <aside className="md:w-64 w-full">
      <ul className="flex md:flex-col flex-row flex-wrap gap-2 md:gap-2 bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-800">
        {tabOrder.map((tab) => {
          // Hide brand settings tab for non-brand users
          if (tab === 'brand' && userRole !== 'BRAND') {
            return null;
          }
          
          const typedTab = tab as keyof typeof tabIcons;
          const Icon = tabIcons[typedTab];
          return (
            <li key={tab} className="flex-1 md:flex-none">
              <button
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold transition-all duration-200
                  ${active === tab
                    ? 'bg-primary text-white shadow-md scale-[1.02] ring-2 ring-primary/20'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary-light hover:scale-[1.01]'}
                `}
                onClick={() => onSelect(tab as SettingsSidebarProps['active'])}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate text-sm md:text-base">{tabLabels[typedTab]}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default SettingsSidebar;
