import React, { createContext, ReactNode } from 'react';
import { toast } from 'sonner';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface NotificationContextType {
  addNotification: (message: string, type?: NotificationType) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  addNotification: () => {},
});

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const addNotification = (
    message: string,
    type: NotificationType = 'info'
  ) => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warning':
        toast.warning(message);
        break;
      default:
        toast(message);
    }
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}
