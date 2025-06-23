import Head from 'next/head';
import { getPageTitle } from '../lib/pageTitle';

const ShippingPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Head>
        <title>{getPageTitle('Shipping')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Shipping</h1>
      <p>
        This is where your shipping information will go. It includes details on
        delivery times, costs, and methods.
      </p>
    </div>
  );
};

export default ShippingPage;
