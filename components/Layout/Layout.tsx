import React, { FC, ReactNode, Dispatch, SetStateAction } from 'react';
import useTheme, { Theme } from '@hooks/useTheme';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  heroSecond?: ReactNode;
  maxWidthClass?: string;
}

const Layout: FC<LayoutProps> = ({ children, heroSecond, maxWidthClass }) => {
  // If useTheme returns [Theme, Dispatch<SetStateAction<Theme>>]
  const [theme, setTheme] = useTheme() as [
    string | Theme,
    Dispatch<SetStateAction<string | Theme>>,
  ];

  const containerWidth = maxWidthClass ?? 'max-w-[95%] 2xl:max-w-[1440px]';

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header
        theme={theme}
        setTheme={setTheme}
        maxWidthClass={containerWidth}
      />
      {heroSecond && (
        <div className={`w-full mx-auto ${containerWidth}`}>{heroSecond}</div>
      )}
      <main
        className={`w-full mx-auto flex-1 px-4 sm:px-6 lg:px-8 py-6 ${containerWidth}`}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
