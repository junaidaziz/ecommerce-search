import { apiFetch } from '@lib/api';
import { useEffect, useState, useRef } from 'react';
import BellIcon from '../icons/BellIcon';
import type { Notification } from '@/types';

export interface NotificationBellProps {
  notifications?: Notification[];
  onClick?: () => void;
}

export default function NotificationBell({
  notifications = [],
  onClick,
}: NotificationBellProps) {
  const [items, setItems] = useState<Notification[]>(notifications);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="btn btn-ghost btn-circle"
        onClick={handleToggle}
        aria-label="Notifications"
      >
        <div className="indicator">
          <BellIcon className="w-5 h-5" />
          {unread > 0 && (
            <span className="badge badge-sm indicator-item">{unread}</span>
          )}
        </div>
      </button>
      {isOpen && (
        <ul
          className="absolute right-0 top-full mt-2 menu p-2 shadow-lg bg-base-100 rounded-lg w-72 space-y-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <li className="flex justify-between items-center px-2 py-1">
            <span className="font-semibold text-sm">Notifications</span>
            {unread > 0 && (
              <button type="button" className="btn btn-xs" onClick={markAll}>
                Mark all as read
              </button>
            )}
          </li>
          {items.length > 0 ? (
            items.map((n) => (
              <li key={n.id} className={n.read ? '' : 'font-semibold'}>
                <span className="text-sm">{n.message}</span>
              </li>
            ))
          ) : (
            <li className="px-2 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              No notifications
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
