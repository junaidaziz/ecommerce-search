import { apiFetch } from '@lib/api';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import BellIcon from '../icons/BellIcon';
import type { Notification } from '@/types';
import { NotificationType } from '@/types';

export interface NotificationBellProps {
  notifications?: Notification[];
  onClick?: () => void;
}

const notificationTypeLabels: Record<NotificationType, string> = {
  [NotificationType.ORDER_UPDATE]: '📦 Order',
  [NotificationType.PROMOTION]: '🎉 Promo',
  [NotificationType.DISCOUNT]: '💰 Discount',
  [NotificationType.GENERAL]: '📢 Info',
};

const notificationTypeColors: Record<NotificationType, string> = {
  [NotificationType.ORDER_UPDATE]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [NotificationType.PROMOTION]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  [NotificationType.DISCOUNT]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  [NotificationType.GENERAL]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export default function NotificationBell({
  notifications = [],
  onClick,
}: NotificationBellProps) {
  const [items, setItems] = useState<Notification[]>(notifications);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifications = () => {
    apiFetch('/api/brand/notifications')
      .then((res) => (res.ok ? res.json() : []))
      .then(setItems)
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const i = setInterval(fetchNotifications, 10000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const markAll = () => {
    apiFetch('/api/brand/notifications', { method: 'PATCH' })
      .then(() => fetchNotifications())
      .catch(() => {});
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (onClick) onClick();
  };

  const handleViewAll = () => {
    setIsOpen(false);
    router.push('/user/notifications');
  };

  const unread = items.filter((n) => !n.read).length;

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
        onClick={handleToggle}
        aria-label="Notifications"
      >
        <div className="relative">
          <BellIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </div>
      </button>
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              Notifications
            </h3>
            {unread > 0 && (
              <button
                type="button"
                className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors duration-200"
                onClick={markAll}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {items.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.slice(0, 5).map((n) => {
                  const notifType = (n.type || NotificationType.GENERAL) as NotificationType;
                  return (
                    <li
                      key={n.id}
                      className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 cursor-pointer ${
                        !n.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${notificationTypeColors[notifType]}`}
                            >
                              {notificationTypeLabels[notifType]}
                            </span>
                            {!n.read && (
                              <span className="w-2 h-2 bg-primary rounded-full"></span>
                            )}
                          </div>
                          <p
                            className={`text-sm ${
                              !n.read
                                ? 'font-semibold text-gray-900 dark:text-white'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {n.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {formatTime(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-4 py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <BellIcon className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  No notifications
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  You're all caught up!
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <button
                onClick={handleViewAll}
                className="w-full px-4 py-3 text-sm font-semibold text-primary hover:text-primary-dark transition-colors duration-200"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
