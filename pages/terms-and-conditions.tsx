import Head from 'next/head';
import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from 'react';
import { getPageTitle } from '../lib/pageTitle';
import { fetchJson } from '../lib/utils/fetchJson';

const TermsPage: React.FC = () => {
  const [content, setContent] = useState('');

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
        <p>Loading...</p>
      )}
    </div>
  );
};

export default TermsPage;
