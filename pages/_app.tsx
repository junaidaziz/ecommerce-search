import '../styles/globals.css';
import { AppProvider } from '../contexts/AppContext';
import Layout from '../components/Layout';
import { SessionProvider } from 'next-auth/react';
import { NotificationProvider } from '../contexts/NotificationContext';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  const HeroSecond = (Component as any).heroSecond;
  return (
    <SessionProvider session={session}>
      <NotificationProvider>
        <AppProvider>
          <Layout heroSecond={HeroSecond ? <HeroSecond /> : null}>
            <Component {...pageProps} />
          </Layout>
        </AppProvider>
      </NotificationProvider>
    </SessionProvider>
  );
}
