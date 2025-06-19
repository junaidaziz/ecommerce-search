import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export default function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  // Determine initial theme on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) {
      setTheme(stored);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  // Apply theme class and persist preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const html = document.documentElement;
    const isDark = theme === 'dark';
    html.setAttribute('data-theme', isDark ? 'dark' : 'cupcake');
    html.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return [theme, setTheme] as const;
}
