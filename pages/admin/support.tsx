import { useContext, useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import { AppContext } from '@contexts/AppContext';
import { fetchJson } from '@utils/fetchJson';
import { getPageTitle } from '@lib/pageTitle';
import { SupportTicket, USER_ROLES } from '@/types';
import SearchFilterBar from '@components/common/SearchFilterBar';

export default function SupportTickets() {
  const { user } = useContext(AppContext)!;
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState({ label: 'Newest', value: 'newest' });
  const [loading, setLoading] = useState(true);

  const statusOptions = [
    { label: 'All', value: 'all' },
    { label: 'Open', value: 'open' },
    { label: 'Resolved', value: 'resolved' },
  ];
  const sortOptions = [
    { label: 'Newest', value: 'newest' },
    { label: 'Oldest', value: 'oldest' },
  ];

  useEffect(() => {
    setLoading(true);
    const url = status === 'all' ? '/api/admin/support' : `/api/admin/support?status=${status}`;
    fetchJson<SupportTicket[]>(url)
      .then(setTickets)
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, [status]);

  const filteredTickets = useMemo(() => {
    let filtered = tickets;
    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter(t =>
        t.subject.toLowerCase().includes(s) ||
        t.message.toLowerCase().includes(s) ||
        (t.user?.email || '').toLowerCase().includes(s)
      );
    }
    if (sortBy.value === 'newest') {
      filtered = filtered.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      filtered = filtered.slice().sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return filtered;
  }, [tickets, search, sortBy]);

  if (!user) return <div className="p-4">Please log in to view tickets.</div>;
  if (user.role.toUpperCase() !== USER_ROLES.SUPER_ADMIN)
    return <div className="p-4">Admin access required.</div>;

  return (
    <>
      <Head>
        <title>{getPageTitle('Support Tickets')}</title>
      </Head>
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-blue-600 to-green-800">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Support Tickets</h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">View and manage all support tickets submitted by users. Search, filter, and resolve issues efficiently.</p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-950 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-800 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Support Tickets</h2>
              <p className="text-gray-600 dark:text-gray-300">Total: {filteredTickets.length} tickets</p>
            </div>
          </div>
        </div>
        <div className="mb-8">
          <SearchFilterBar
            searchValue={search}
            onSearchChange={e => setSearch(e.target.value)}
            onSearchSubmit={e => { e.preventDefault(); }}
            filterValue={statusOptions.find(opt => opt.value === status) || statusOptions[0]}
            filterOptions={statusOptions}
            onFilterChange={val => { if (val) setStatus(val.value); }}
            placeholder="Search tickets..."
            buttonText="Search"
            className="mb-4"
          />
          <div className="flex gap-4 mt-2">
            <div className="min-w-[180px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
              <select
                className="h-12 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-400 focus:border-green-400 px-4 text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-w-[180px] w-full transition"
                value={sortBy.value}
                onChange={e => {
                  const selected = sortOptions.find(opt => opt.value === e.target.value);
                  if (selected) setSortBy(selected);
                }}
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-950 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-100 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Message</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading tickets...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No tickets found
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t, idx) => (
                    <tr key={t.id} className={`transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-950'} border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800`}>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100 font-medium">{t.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-200">{t.user?.email || 'anonymous'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${t.status === 'resolved' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'}`}>{t.status === 'resolved' ? 'Resolved' : 'Open'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{new Date(t.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-pre-line text-gray-900 dark:text-gray-100 max-w-xs break-words">{t.message}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
