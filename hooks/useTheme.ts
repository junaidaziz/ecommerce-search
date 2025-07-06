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
    
    // Remove existing theme classes
    html.classList.remove('light', 'dark');
    
    // Add new theme class
    html.classList.add(theme);
    
    // Set data-theme attribute for DaisyUI
    html.setAttribute('data-theme', theme);
    
    // Persist to localStorage
    localStorage.setItem('theme', theme);
    
    // Log for debugging
    console.log('Theme changed to:', theme);
  }, [theme]);

  return [theme, setTheme] as const;
}
