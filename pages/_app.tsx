import '../styles/globals.css';
import 'react-quill/dist/quill.snow.css';
import { AppProvider } from '@contexts/AppContext';
import Layout from '@components/Layout/Layout';
import { SessionProvider } from 'next-auth/react';
import { NotificationProvider } from '@contexts/NotificationContext';
import { Toaster } from 'sonner';
import { ChatProvider } from '@contexts/ChatContext';

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
          <ChatProvider>
            <Toaster position="top-right" richColors />
            <Layout
              heroSecond={HeroSecond ? <HeroSecond /> : null}
              maxWidthClass={maxWidthClass}
            >
              <Component {...pageProps} />
            </Layout>
          </ChatProvider>
        </AppProvider>
      </NotificationProvider>
    </SessionProvider>
  );
}
