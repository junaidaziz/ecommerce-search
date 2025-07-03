import { useContext, useEffect, useState } from 'react';
import Head from 'next/head';
import { AppContext } from '@contexts/AppContext';
import { fetchJson } from '@utils/fetchJson';
import { getPageTitle } from '@lib/pageTitle';
import type { SupportTicket } from '@/types';

export default function SupportTickets() {
  const { user } = useContext(AppContext)!;
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [status, setStatus] = useState('open');

  useEffect(() => {
    fetchJson<SupportTicket[]>(`/api/admin/support?status=${status}`)
      .then(setTickets)
      .catch(() => setTickets([]));
  }, [status]);

  if (!user) return <div className="p-4">Please log in to view tickets.</div>;
  if (user.role !== 'super-admin')
    return <div className="p-4">Admin access required.</div>;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <Head>
        <title>{getPageTitle('Support Tickets')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Support Tickets</h1>
      <div className="form-control max-w-xs">
        <label className="label">
          <span className="label-text">Status</span>
        </label>
        <select
          className="select select-bordered"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="open">open</option>
          <option value="resolved">resolved</option>
        </select>
      </div>
      <ul className="mt-4 space-y-2">
        {tickets.map((t) => (
          <li key={t.id} className="p-2 border rounded">
            <div className="font-semibold">{t.subject}</div>
            <div className="text-sm">
              {t.user?.email || 'anonymous'} -{' '}
              {new Date(t.createdAt).toLocaleString()}
            </div>
            <div className="mt-1">{t.message}</div>
          </li>
        ))}
        {tickets.length === 0 && <li>No tickets</li>}
      </ul>
    </div>
  );
}
