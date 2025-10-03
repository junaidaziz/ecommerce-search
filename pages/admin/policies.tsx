import { useContext, useEffect, useState } from 'react';
import Head from 'next/head';
import ReactMarkdown from 'react-markdown';
import { AppContext } from '@contexts/AppContext';
import { fetchJson } from '@utils/fetchJson';
import { getPageTitle } from '@lib/pageTitle';
import { USER_ROLES } from '@/types';
import PageHero from '@components/UI/PageHero';
import { toast } from 'sonner';

const TYPES = [
  { value: 'terms', label: 'Terms & Conditions' },
  { value: 'privacy', label: 'Privacy Policy' },
  { value: 'shipping', label: 'Shipping & Return Policy' },
];

export default function ManagePolicies() {
  const { user } = useContext(AppContext)!;
  const [type, setType] = useState('terms');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchJson<{ content?: string }>(`/api/admin/policies?type=${type}`)
      .then((doc) => setContent(doc?.content || ''))
      .catch(() => setContent(''));
  }, [type]);

  if (!user) return <div className="p-4 text-gray-700 dark:text-gray-300">Please log in to view policies.</div>;
  if (user.role !== USER_ROLES.SUPER_ADMIN)
    return <div className="p-4 text-gray-700 dark:text-gray-300">Admin access required.</div>;

  const save = async () => {
    try {
      await fetchJson('/api/admin/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content }),
      });
      toast.success('Policy saved successfully');
    } catch (error) {
      toast.error('Failed to save policy');
    }
  };

  return (
    <>
      <Head>
        <title>{getPageTitle('Manage Policies')}</title>
      </Head>
      <PageHero heading="Manage Policies" />
      <div className="w-full px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text text-gray-700 dark:text-gray-300">Policy Type</span>
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent h-40"
      />
      <button onClick={save} className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors">
        Save
      </button>
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold mt-4 text-gray-900 dark:text-gray-100">Preview</h2>
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
    </>
  );
}
