import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { Toast } from '@/components/UI';

type NotificationType = 'info' | 'success' | 'warning' | 'error';
type NotificationPosition = 'center' | 'top-right' | 'top-left' | 'end' | string;

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
  position: NotificationPosition;
}

interface NotificationContextType {
  addNotification: (
    message: string,
    type?: NotificationType,
    position?: NotificationPosition
  ) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  addNotification: () => {},
});

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifs, setNotifs] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (
      message: string,
      type: NotificationType = 'info',
      position: NotificationPosition = 'end'
    ) => {
      const id = Date.now() + Math.random();
      setNotifs((prev) => [...prev, { id, message, type, position }]);
      setTimeout(() => {
        setNotifs((prev) => prev.filter((n) => n.id !== id));
      }, 5000);
    },
    []
  );

  const removeNotification = useCallback((id: number) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 space-y-2">
          {notifs
            .filter((n) => n.position === 'center')
            .map((n) => (
              <Toast
                key={n.id}
                message={n.message}
                type={n.type}
                onClose={() => removeNotification(n.id)}
              />
            ))}
        </div>
        <div className="absolute right-5 top-5 space-y-2">
          {notifs
            .filter((n) => n.position === 'top-right')
            .map((n) => (
              <Toast
                key={n.id}
                message={n.message}
                type={n.type}
                onClose={() => removeNotification(n.id)}
              />
            ))}
        </div>
        <div className="absolute left-5 top-5 space-y-2">
          {notifs
            .filter((n) => n.position === 'top-left')
            .map((n) => (
              <Toast
                key={n.id}
                message={n.message}
                type={n.type}
                onClose={() => removeNotification(n.id)}
              />
            ))}
        </div>
        <div className="absolute right-5 bottom-5 space-y-2">
          {notifs
            .filter(
              (n) =>
                n.position !== 'center' &&
                n.position !== 'top-right' &&
                n.position !== 'top-left'
            )
            .map((n) => (
              <Toast
                key={n.id}
                message={n.message}
                type={n.type}
                onClose={() => removeNotification(n.id)}
              />
            ))}
        </div>
      </div>
    </NotificationContext.Provider>
  );
}
