import Head from 'next/head';
import { getPageTitle } from '../lib/pageTitle';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Head>
        <title>{getPageTitle('About')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">About Us</h1>
      <p>
        ShopVerse is a modern ecommerce marketplace bringing the best products to
        your fingertips. This page is a placeholder showcasing where you would
        normally describe your company history and mission.
      </p>
      <p>
        Use this space to highlight your values, share your story and let your
        customers know what makes you unique.
      </p>
    </div>
  );
};

export default AboutPage;
