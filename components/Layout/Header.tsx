import React, { FC, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { useSession } from 'next-auth/react';
import UserHeader from './UserHeader';
import BrandHeader from './BrandHeader';

interface HeaderProps {
  theme?: string;
  setTheme?: React.Dispatch<React.SetStateAction<string>>;
}

const Header: FC<HeaderProps> = ({ theme = 'light', setTheme }) => {
  const app = useContext(AppContext);
  const { data: session } = useSession();
  const role =
    app?.user?.role?.toLowerCase() ||
    (
      (session?.user as { role?: string } | undefined)?.role || ''
    ).toLowerCase();
  if (role === 'brand') {
    return <BrandHeader theme={theme} setTheme={setTheme} />;
  }
  return <UserHeader theme={theme} setTheme={setTheme} />;
};

export default Header;
