import useTheme from '../hooks/useTheme';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  const [theme, setTheme] = useTheme();

  return (
    <div className="flex flex-col min-h-screen">
      <Header theme={theme} setTheme={setTheme} />
      <main className="container mx-auto flex-1 px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}
