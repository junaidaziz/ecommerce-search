import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';

export default function Cancel() {
  return (
    <div className="p-4">
      <Head>
        <title>{getPageTitle('Payment Canceled')}</title>
      </Head>
      Payment canceled.
    </div>
  );
}
