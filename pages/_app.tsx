import '../styles/globals.css';
import { AppProvider } from '@contexts/AppContext';
import Layout from '@components/Layout/Layout';
import { SessionProvider } from 'next-auth/react';
import { NotificationProvider } from '@contexts/NotificationContext';
import { Toaster } from 'sonner';

import type { AppProps } from 'next/app';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps & { pageProps: { session: any } }) {
  const HeroSecond = (Component as any).heroSecond;
  const maxWidthClass = (Component as any).maxWidthClass;
  return (
    <SessionProvider session={session}>
      <NotificationProvider>
        <AppProvider>
          <Toaster position="top-right" richColors />
          <Layout
            heroSecond={HeroSecond ? <HeroSecond /> : null}
            maxWidthClass={maxWidthClass}
          >
            <Component {...pageProps} />
          </Layout>
        </AppProvider>
      </NotificationProvider>
    </SessionProvider>
  );
}
