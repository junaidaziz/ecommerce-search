import Head from 'next/head';
import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from 'react';
import { getPageTitle } from '@lib/pageTitle';
import { fetchJson } from '@utils/fetchJson';

const PrivacyPolicyPage: React.FC = () => {
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    fetchJson<{ content: string }>(`/api/policies?type=privacy`)
      .then((d) => setContent(d.content))
      .catch(() => setContent(''));
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Head>
        <title>{getPageTitle('Privacy Policy')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      {content ? (
        <div className="prose">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      ) : (
        <div className="space-y-4">
          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Data Collection</h2>
            <p>
              We only collect the information necessary to process your orders
              and improve your shopping experience.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Usage</h2>
            <p>
              Your details are used solely to provide our services and are not
              sold or shared for advertising purposes.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Third-Party Access</h2>
            <p>
              Access to your data is limited to trusted partners like payment
              processors and shipping carriers.
            </p>
          </section>
        </div>
      )}
    </div>
  );
};

export default PrivacyPolicyPage;
