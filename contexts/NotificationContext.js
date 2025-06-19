import { createContext, useState, useCallback } from 'react';

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifs, setNotifs] = useState([]);

  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setNotifs((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifs((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="toast toast-end space-y-2">
        {notifs.map((n) => (
          <div key={n.id} className={`alert alert-${n.type} shadow-md`}>
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
