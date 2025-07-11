import React, { FC, useContext } from 'react';
import { AppContext } from '@contexts/AppContext';
import { useSession } from 'next-auth/react';
import UserHeader from './UserHeader';
import BrandHeader from './BrandHeader';
import { USER_ROLES } from '@/types';
import type { Theme } from '@contexts/ThemeContext';

interface HeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  maxWidthClass?: string;
}

const Header: FC<HeaderProps> = ({
  theme,
  setTheme,
  maxWidthClass,
}) => {
  const app = useContext(AppContext);
  const { data: session } = useSession();
  const role = (
    app?.user?.role || (session?.user as { role?: string } | undefined)?.role || ''
  ).toString();

  if (role === USER_ROLES.BRAND) {
    return <BrandHeader theme={theme} setTheme={setTheme} />;
  }
  return <UserHeader theme={theme} setTheme={setTheme} maxWidthClass={maxWidthClass} />;
};

export default Header;
