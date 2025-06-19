import { useEffect, useState } from 'react';
import '../styles/globals.css';
import { AppProvider } from '../contexts/AppContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { SessionProvider } from 'next-auth/react';
import { NotificationProvider } from '../contexts/NotificationContext';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedTheme =
      typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const t = theme === 'dark' ? 'dark' : 'cupcake';
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  return (
    <SessionProvider session={session}>
      <NotificationProvider>
        <AppProvider>
          <Header theme={theme} setTheme={setTheme} />
          <Component {...pageProps} theme={theme} setTheme={setTheme} />
          <Footer />
        </AppProvider>
      </NotificationProvider>
    </SessionProvider>
  );
}
