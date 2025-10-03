import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';

const Permissions: React.FC = () => (
  <div className="max-w-2xl mx-auto px-4 py-6">
    <Head>
      <title>{getPageTitle('Permissions')}</title>
    </Head>
    <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Permissions</h1>
    <p className="text-gray-700 dark:text-gray-300">Manage your permissions and marketing preferences here.</p>
  </div>
);

export default Permissions;
