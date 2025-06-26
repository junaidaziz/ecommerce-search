import { useEffect, useState } from 'react';
import BellIcon from './icons/BellIcon';
import type { Notification } from '../types';

export default function NotificationBell() {
  const [items, setItems] = useState<Notification[]>([]);

  const fetchNotifications = () => {
    fetch('/api/brand/notifications')
      .then((res) => (res.ok ? res.json() : []))
      .then(setItems)
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const i = setInterval(fetchNotifications, 10000);
    return () => clearInterval(i);
  }, []);

  const markAll = () => {
    fetch('/api/brand/notifications', { method: 'PATCH' })
      .then(() => fetchNotifications())
      .catch(() => {});
  };

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        <div className="indicator">
          <BellIcon className="w-5 h-5" />
          {unread > 0 && (
            <span className="badge badge-sm indicator-item">{unread}</span>
          )}
        </div>
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 shadow bg-base-100 rounded w-52 space-y-1"
      >
        <li className="flex justify-between items-center">
          <span className="font-semibold">Notifications</span>
          {unread > 0 && (
            <button type="button" className="btn btn-xs" onClick={markAll}>
              Mark all as read
            </button>
          )}
        </li>
        {items.map((n) => (
          <li key={n.id} className={n.read ? '' : 'font-semibold'}>
            <span>{n.message}</span>
          </li>
        ))}
        {items.length === 0 && <li>No notifications</li>}
      </ul>
    </div>
  );
}
