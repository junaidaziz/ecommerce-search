import { useEffect, useState } from 'react';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  return <Component {...pageProps} theme={theme} setTheme={setTheme} />;
}