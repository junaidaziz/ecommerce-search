import Head from 'next/head';
import { useState, useEffect, useContext } from 'react';
import { AppContext } from '@contexts/AppContext';
import { getPageTitle } from '@lib/pageTitle';
import PageHero from '@components/UI/PageHero';
import AdminPanelLayout from '@components/Layout/AdminPanelLayout';

export default function SupportTickets() {
  const { user } = useContext(AppContext)!;
  const [tickets, setTickets] = useState<any[]>([]);
  const [status, setStatus] = useState('open');

  useEffect(() => {
    // Fetch tickets based on status
    // Replace with your actual API call
    setTickets([]); // Placeholder
  }, [status]);

  if (!user) return <div className="p-4">Please log in to view support tickets.</div>;
  if (user.role.toUpperCase() !== 'SUPER_ADMIN')
    return <div className="p-4">Admin access required.</div>;

  return (
    <AdminPanelLayout>
      <Head>
        <title>{getPageTitle('Support Tickets')}</title>
      </Head>
      <PageHero heading="Support Tickets" description="View and manage all support tickets from users and vendors." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-950 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-800 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Support Tickets</h2>
              <p className="text-gray-600 dark:text-gray-300">Total: {tickets.length} tickets</p>
            </div>
            <div className="flex gap-2 items-center">
              <label className="font-medium text-gray-700 dark:text-gray-200">Status:</label>
              <select
                className="select select-bordered w-full max-w-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {tickets.length === 0 && (
                <li className="py-8 text-center text-gray-400 dark:text-gray-500">No tickets</li>
              )}
              {tickets.map((t) => (
                <li key={t.id} className="py-4 px-2 sm:px-4 flex flex-col sm:flex-row sm:items-center gap-2 bg-white dark:bg-gray-950 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors border border-gray-100 dark:border-gray-800 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white truncate">{t.subject}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {t.user?.email || 'anonymous'} &ndash; {new Date(t.createdAt).toLocaleString()}
                    </div>
                    <div className="mt-1 text-gray-700 dark:text-gray-200 break-words">{t.message}</div>
                  </div>
                  <div className="flex flex-col gap-2 sm:items-end">
                    {/* Add actions here if needed */}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AdminPanelLayout>
  );
}
