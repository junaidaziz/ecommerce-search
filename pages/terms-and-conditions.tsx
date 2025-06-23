import Head from 'next/head';
import { getPageTitle } from '../lib/pageTitle';

const TermsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Head>
        <title>{getPageTitle('Terms & Conditions')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Terms &amp; Conditions</h1>
      <p>
        Here you can outline the rules and regulations for using your website
        and services. Replace this text with your official terms and conditions.
      </p>
    </div>
  );
};

export default TermsPage;
