import Head from 'next/head';
import HomeHero from '../components/HomeHero';
import FeaturedProducts from '../components/FeaturedProducts';
import CategoryPromotion from '../components/CategoryPromotion';
import { getPageTitle } from '../lib/pageTitle';

const HomePage: React.FC & { maxWidthClass?: string } = () => {
  return (
    <>
      <Head>
        <title>{getPageTitle('Home')}</title>
      </Head>
      <HomeHero />
      <FeaturedProducts />
      <CategoryPromotion />
    </>
  );
};

HomePage.maxWidthClass = 'max-w-none p-0';

export default HomePage;
