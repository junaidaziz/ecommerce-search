import React from 'react';
export interface NotificationContextValue {
  addNotification: (msg: string, type?: string, position?: string) => void;
}

export const NotificationContext: React.Context<NotificationContextValue>;
