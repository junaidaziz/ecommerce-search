import Head from 'next/head';
import { getPageTitle } from '../lib/pageTitle';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Head>
        <title>{getPageTitle('Privacy Policy')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <p>
        This page explains how your personal data is collected, used, and
        protected. Replace this text with your actual privacy policy.
      </p>
    </div>
  );
};

export default PrivacyPolicyPage;
