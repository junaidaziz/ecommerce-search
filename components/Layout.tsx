import React, { FC, ReactNode, Dispatch, SetStateAction } from 'react';
import useTheme, { Theme } from '../hooks/useTheme';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  heroSecond?: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children, heroSecond }) => {
  // If useTheme returns [Theme, Dispatch<SetStateAction<Theme>>]
  const [theme, setTheme] = useTheme() as [string | Theme, Dispatch<SetStateAction<string | Theme>>];

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header theme={theme} setTheme={setTheme} />
      {heroSecond && <div className="w-full">{heroSecond}</div>}
      <main className="container mx-auto flex-1 px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
