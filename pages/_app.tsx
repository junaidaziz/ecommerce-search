import { SessionProvider } from 'next-auth/react';
import { AppProps } from 'next/app';
import { NotificationProvider } from '@contexts/NotificationContext';
import { ChatProvider } from '@contexts/ChatContext';
import { AppProvider } from '@contexts/AppContext';
import Layout from '@components/Layout/Layout';
import { Toaster } from 'sonner';
import 'react-quill/dist/quill.snow.css';
import '../styles/globals.css';
import { ThemeProvider } from '@contexts/ThemeContext';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps & { pageProps: { session: any } }) {
  const HeroSecond = (Component as any).heroSecond;
  const maxWidthClass = (Component as any).maxWidthClass;
  const getLayout = (Component as any).getLayout || ((page: React.ReactNode) => (
    <Layout heroSecond={HeroSecond ? <HeroSecond /> : null} maxWidthClass={maxWidthClass}>{page}</Layout>
  ));

  return (
    <SessionProvider session={session}>
      <NotificationProvider>
        <AppProvider>
          <ChatProvider>
            <ThemeProvider>
              <Toaster position="top-right" richColors />
              {getLayout(<Component {...pageProps} />)}
            </ThemeProvider>
          </ChatProvider>
        </AppProvider>
      </NotificationProvider>
    </SessionProvider>
  );
}
