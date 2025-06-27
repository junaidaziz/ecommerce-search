import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    if (!session_id) return;
    fetch('/api/checkout/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session_id }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [session_id]);

  if (status === 'processing')
    return (
      <p className="p-4">
        <Head>
          <title>{getPageTitle('Processing Payment')}</title>
        </Head>
        Processing payment...
      </p>
    );
  if (status === 'error')
    return (
      <p className="p-4">
        <Head>
          <title>{getPageTitle('Payment Failed')}</title>
        </Head>
        Payment failed.
      </p>
    );
  return (
    <p className="p-4">
      <Head>
        <title>{getPageTitle('Payment Successful')}</title>
      </Head>
      Payment successful! Check your email for confirmation.
    </p>
  );
}
