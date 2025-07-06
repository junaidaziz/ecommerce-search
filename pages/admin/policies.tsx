import { useContext, useEffect, useState } from 'react';
import Head from 'next/head';
import ReactMarkdown from 'react-markdown';
import { AppContext } from '@contexts/AppContext';
import { fetchJson } from '@utils/fetchJson';
import { getPageTitle } from '@lib/pageTitle';
import { USER_ROLES } from '@/types';

const TYPES = [
  { value: 'terms', label: 'Terms & Conditions' },
  { value: 'privacy', label: 'Privacy Policy' },
  { value: 'shipping', label: 'Shipping & Return Policy' },
];

export default function ManagePolicies() {
  const { user } = useContext(AppContext)!;
  const [type, setType] = useState('terms');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchJson<any>(`/api/admin/policies?type=${type}`)
      .then((doc) => setContent(doc?.content || ''))
      .catch(() => setContent(''));
  }, [type]);

  if (!user) return <div className="p-4">Please log in to view policies.</div>;
  if (user.role !== USER_ROLES.SUPER_ADMIN)
    return <div className="p-4">Admin access required.</div>;

  const save = async () => {
    await fetchJson('/api/admin/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, content }),
    });
    setMessage('Policy saved');
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 space-y-4">
      <Head>
        <title>{getPageTitle('Manage Policies')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Manage Policies</h1>
      {message && <div className="text-green-600">{message}</div>}
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Policy Type</span>
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="select select-bordered"
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
        className="textarea textarea-bordered w-full h-40"
      />
      <button onClick={save} className="btn btn-primary">
        Save
      </button>
      <div>
        <h2 className="text-lg font-semibold mt-4">Preview</h2>
        <div className="prose">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
