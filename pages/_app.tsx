import { SessionProvider } from 'next-auth/react';
import { AppProps } from 'next/app';
import { NotificationProvider } from '@contexts/NotificationContext';
import { ChatProvider } from '@contexts/ChatContext';
import { AppProvider } from '@contexts/AppContext';
import Layout from '@components/Layout/Layout';
import { Toaster } from 'sonner';
import 'react-quill/dist/quill.snow.css';
import '../styles/globals.css';

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
