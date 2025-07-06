import { KeyIcon, HomeIcon, EnvelopeIcon, CreditCardIcon, TagIcon, UserIcon } from '@heroicons/react/24/outline';

interface SettingsSidebarProps {
  active: 'profile' | 'password' | 'address' | 'email' | 'payments' | 'coupons';
  onSelect: (tab: SettingsSidebarProps['active']) => void;
}

const tabIcons = {
  profile: UserIcon,
  password: KeyIcon,
  address: HomeIcon,
  email: EnvelopeIcon,
  payments: CreditCardIcon,
  coupons: TagIcon,
};

const tabLabels = {
  profile: 'Update Profile',
  password: 'Change Password',
  address: 'Manage Address',
  email: 'Change Email',
  payments: 'Payment Methods',
  coupons: 'Coupons & Offers',
};

const tabOrder = [
  'profile',
  'password',
  'address',
  'email',
  'payments',
  'coupons',
];

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  active,
  onSelect,
}) => {
  return (
    <aside className="md:w-56 w-full">
      <ul className="flex md:flex-col flex-row gap-2 md:gap-3 bg-base-100 rounded-2xl p-4 shadow-md">
        {tabOrder.map((tab) => {
          const typedTab = tab as keyof typeof tabIcons;
          const Icon = tabIcons[typedTab];
          return (
            <li key={tab} className="flex-1">
              <button
                className={`flex items-center gap-2 w-full px-4 py-2 rounded-full font-semibold transition-all duration-150
                  ${active === tab
                    ? 'bg-primary text-white shadow-lg scale-105'
                    : 'bg-base-200 text-gray-700 hover:bg-primary/10 hover:text-primary'}
                `}
                onClick={() => onSelect(tab as SettingsSidebarProps['active'])}
              >
                <Icon className="w-5 h-5" />
                <span className="truncate">{tabLabels[typedTab]}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default SettingsSidebar;
