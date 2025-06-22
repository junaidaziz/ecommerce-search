import Head from 'next/head';
import HomeHeader from '../components/HomeHeader';
import HomeHero from '../components/HomeHero';
import FeaturedProducts from '../components/FeaturedProducts';
import CategoryPromotion from '../components/CategoryPromotion';
import Footer from '../components/Footer';
import { getPageTitle } from '../lib/pageTitle';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{getPageTitle('Home')}</title>
      </Head>
      <HomeHeader />
      <main className="flex-1">
        <HomeHero />
        <FeaturedProducts />
        <CategoryPromotion />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
