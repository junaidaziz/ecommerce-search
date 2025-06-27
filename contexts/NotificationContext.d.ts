import React from 'react';
export interface NotificationContextValue {
  addNotification: (
    msg: string,
    type?: 'info' | 'success' | 'warning' | 'error'
  ) => void;
}

export const NotificationContext: React.Context<NotificationContextValue>;
