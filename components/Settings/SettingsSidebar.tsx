interface SettingsSidebarProps {
  active: 'profile' | 'password' | 'address' | 'email' | 'payments';
  onSelect: (tab: SettingsSidebarProps['active']) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ active, onSelect }) => {
  const tabButtonClass = (tab: SettingsSidebarProps['active']) =>
    `w-full text-left px-2 py-2 rounded transition-colors hover:bg-base-200 ${
      active === tab ? 'text-primary underline font-semibold' : ''
    }`;

  return (
    <aside className="md:w-48 w-full">
      <ul className="menu menu-vertical bg-base-100 rounded-box p-2 space-y-1">
        <li>
          <button className={tabButtonClass('profile')} onClick={() => onSelect('profile')}>
            Update Profile
          </button>
        </li>
        <li>
          <button className={tabButtonClass('password')} onClick={() => onSelect('password')}>
            Change Password
          </button>
        </li>
        <li>
          <button className={tabButtonClass('address')} onClick={() => onSelect('address')}>
            Manage Address
          </button>
        </li>
        <li>
          <button className={tabButtonClass('email')} onClick={() => onSelect('email')}>
            Change Email
          </button>
        </li>
        <li>
          <button className={tabButtonClass('payments')} onClick={() => onSelect('payments')}>
            Payment Methods
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default SettingsSidebar;
