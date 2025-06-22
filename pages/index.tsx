import Head from 'next/head';
import HomeHero from '../components/HomeHero';
import FeaturedProducts from '../components/FeaturedProducts';
import CategoryPromotion from '../components/CategoryPromotion';
import { getPageTitle } from '../lib/pageTitle';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{getPageTitle('Home')}</title>
      </Head>
      <main className="flex-1">
        <HomeHero />
        <FeaturedProducts />
        <CategoryPromotion />
      </main>
    </div>
  );
};

export default HomePage;
