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
      <main className="flex-1">
        <div className="max-w-screen-xl mx-auto p-4">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
