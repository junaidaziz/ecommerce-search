import { useEffect, useState } from 'react';
import '../styles/globals.css';
import { AppProvider } from '../contexts/AppContext';
import Header from '../components/Header';
import { SessionProvider } from 'next-auth/react';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
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

  return (
    <SessionProvider session={session}>
      <AppProvider>
        <Header />
        <Component {...pageProps} theme={theme} setTheme={setTheme} />
      </AppProvider>
    </SessionProvider>
  );
}