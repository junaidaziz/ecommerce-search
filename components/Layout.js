import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const t = theme === 'dark' ? 'dark' : 'cupcake';
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header theme={theme} setTheme={setTheme} />
      <main className="flex-1">
        <div className="max-w-screen-xl mx-auto p-4">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
