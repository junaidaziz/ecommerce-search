import Head from 'next/head';
import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from 'react';
import { getPageTitle } from '@lib/pageTitle';
import { fetchJson } from '@utils/fetchJson';

const ShippingPage: React.FC = () => {
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    fetchJson<{ content: string }>(`/api/policies?type=shipping`)
      .then((d) => setContent(d.content))
      .catch(() => setContent(''));
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Head>
        <title>{getPageTitle('Shipping Information')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Shipping Information</h1>
      {content ? (
        <div className="prose">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      ) : (
        <div className="space-y-2">
          <p>
            Orders are typically processed within 1-2 business days. Delivery
            times vary by destination but average 3-5 business days for
            domestic shipments.
          </p>
          <p>
            We currently ship to most regions across the UK and Europe. Please
            contact us if you need details about a specific location.
          </p>
          <p>
            All parcels are dispatched via leading carriers such as Royal Mail
            and DHL. Tracking details will be provided once your order leaves
            our warehouse.
          </p>
        </div>
      )}
    </div>
  );
};

export default ShippingPage;
