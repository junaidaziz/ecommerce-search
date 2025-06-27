import { useState } from 'react';
import Head from 'next/head';
import { fetchJson } from '@utils/fetchJson';
import { getPageTitle } from '@lib/pageTitle';

export default function SupportPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [info, setInfo] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchJson('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, message }),
    });
    setInfo('Ticket submitted');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Head>
        <title>{getPageTitle('Support')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Support</h1>
      {info && <div className="text-green-600">{info}</div>}
      <form onSubmit={submit} className="space-y-2">
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        <textarea
          className="textarea textarea-bordered w-full h-40"
          placeholder="How can we help?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
}
