import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  const [theme, setTheme] = useState('light');

  // Load stored theme preference on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('theme');
    if (stored) {
      setTheme(stored);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  // Apply theme changes to the DOM and persist them
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const html = document.documentElement;
      const isDark = theme === 'dark';
      const t = isDark ? 'dark' : 'cupcake';
      html.setAttribute('data-theme', t);
      html.classList.toggle('dark', isDark);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header theme={theme} setTheme={setTheme} />
      <main className="container mx-auto flex-1 px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}
