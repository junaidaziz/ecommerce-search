import { SessionProvider, Session } from 'next-auth/react';
import { AppProps } from 'next/app';
import { NotificationProvider } from '@contexts/NotificationContext';
import { ChatProvider } from '@contexts/ChatContext';
import { AppProvider } from '@contexts/AppContext';
import Layout from '@components/Layout/Layout';
import { Toaster } from 'sonner';
import 'react-quill/dist/quill.snow.css';
import '../styles/globals.css';
import '../styles/custom.css';
import '../styles/overrides.css';
import { ThemeProvider } from '@contexts/ThemeContext';

interface PageComponent {
  heroSecond?: React.ComponentType;
  maxWidthClass?: string;
  getLayout?: (page: React.ReactNode) => JSX.Element;
}

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps & { pageProps: { session: Session | null } }) {
  const PageComp = Component as PageComponent & typeof Component;
  const HeroSecond = PageComp.heroSecond;
  const maxWidthClass = PageComp.maxWidthClass;
  const getLayout = PageComp.getLayout || ((page: React.ReactNode) => (
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
