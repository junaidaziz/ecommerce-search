import { useEffect, useState } from 'react';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import { apiFetch } from '@lib/api';
import { NotificationType } from '@/types';
import type { Notification } from '@/types';

const notificationTypeLabels: Record<NotificationType, string> = {
  [NotificationType.ORDER_UPDATE]: 'Order Updates',
  [NotificationType.PROMOTION]: 'Promotions',
  [NotificationType.DISCOUNT]: 'Discounts',
  [NotificationType.GENERAL]: 'General',
};

const notificationTypeColors: Record<NotificationType, string> = {
  [NotificationType.ORDER_UPDATE]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [NotificationType.PROMOTION]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  [NotificationType.DISCOUNT]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  [NotificationType.GENERAL]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

const UserNotifications: React.FC = () => {
  const [notes, setNotes] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    setLoading(true);
    fetch('/api/user/notifications')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setNotes(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const markAsRead = async (id: number) => {
    try {
      const res = await apiFetch('/api/user/notifications', {
        method: 'PATCH',
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const filteredNotes = filter === 'all' 
    ? notes 
    : notes.filter(n => n.type === filter);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(d);
  };

  const unreadCount = notes.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <Head>
        <title>{getPageTitle('Notifications')}</title>
      </Head>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Notification Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with order status, promotions, and more
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              All Notifications
            </button>
            {Object.entries(notificationTypeLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key as NotificationType)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === key
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredNotes.length > 0 ? (
          <div className="space-y-4">
            {filteredNotes.map((n) => {
              const notifType = (n.type || NotificationType.GENERAL) as NotificationType;
              return (
                <div
                  key={n.id}
                  className={`bg-white dark:bg-gray-900 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 p-6 ${
                    !n.read
                      ? 'border-primary dark:border-primary'
                      : 'border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${notificationTypeColors[notifType]}`}
                        >
                          {notificationTypeLabels[notifType]}
                        </span>
                        {!n.read && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                            New
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-base mb-2 ${
                          !n.read
                            ? 'font-semibold text-gray-900 dark:text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {n.message}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="text-sm font-medium text-primary hover:text-primary-dark transition-colors duration-200"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No notifications
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'all'
                ? "You're all caught up! No notifications to show."
                : `No ${notificationTypeLabels[filter as NotificationType].toLowerCase()} to show.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserNotifications;
