import Head from 'next/head';
import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from 'react';
import { getPageTitle } from '@lib/pageTitle';
import { fetchJson } from '@utils/fetchJson';

const TermsPage: React.FC = () => {
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    fetchJson<{ content: string }>(`/api/policies?type=terms`)
      .then((d) => setContent(d.content))
      .catch(() => setContent(''));
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Head>
        <title>{getPageTitle('Terms & Conditions')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Terms &amp; Conditions</h1>
      {content ? (
        <div className="prose">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      ) : (
        <div className="space-y-4">
          <section className="space-y-2">
            <h2 className="text-xl font-semibold">User Responsibilities</h2>
            <p>
              By using this site you agree to act responsibly and comply with
              all local laws and regulations.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Refunds</h2>
            <p>
              Refunds are issued in accordance with our returns policy. Please
              contact support within 30 days of receipt if you have any issues.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Dispute Resolution</h2>
            <p>
              Any disputes will be handled in good faith and resolved through
              our customer service team before seeking further action.
            </p>
          </section>
        </div>
      )}
    </div>
  );
};

export default TermsPage;
