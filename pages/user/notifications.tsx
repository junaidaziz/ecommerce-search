import { useEffect, useState } from 'react';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import type { Notification } from '@/types';

const UserNotifications: React.FC = () => {
  const [notes, setNotes] = useState<Notification[]>([]);
  useEffect(() => {
    fetch('/api/user/notifications')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setNotes(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Head>
        <title>{getPageTitle('Notifications')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Notifications</h1>
      <ul className="space-y-2">
        {notes.map((n) => (
          <li key={n.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 text-gray-900 dark:text-gray-100">
            {n.message}
          </li>
        ))}
        {notes.length === 0 && <li className="text-gray-500 dark:text-gray-400">No notifications.</li>}
      </ul>
    </div>
  );
};

export default UserNotifications;
