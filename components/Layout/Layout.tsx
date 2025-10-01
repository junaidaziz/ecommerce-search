import React, { FC, ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useThemeContext } from '@contexts/ThemeContext';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
  heroSecond?: ReactNode;
  maxWidthClass?: string;
}

const Layout: FC<LayoutProps> = ({ children, heroSecond, maxWidthClass }) => {
  const { theme, setTheme } = useThemeContext();
  const containerWidth = maxWidthClass ?? 'max-w-screen-2xl';
  const router = useRouter();
  const isAdminRoute = router.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {!isAdminRoute && (
        <Header
          theme={theme}
          setTheme={setTheme}
          maxWidthClass={containerWidth}
        />
      )}
      {heroSecond && !isAdminRoute && (
        <div className={`w-full mx-auto ${containerWidth}`}>{heroSecond}</div>
      )}
      <main
        className={`w-full mx-auto flex-1 px-4 sm:px-6 lg:px-8 py-6 ${containerWidth} bg-white dark:bg-gray-950 transition-colors duration-300`}
      >
        {children}
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default Layout;
