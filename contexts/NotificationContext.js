import { createContext, useState, useCallback } from 'react';

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifs, setNotifs] = useState([]);

  const addNotification = useCallback(
    (message, type = 'info', position = 'end') => {
      const id = Date.now() + Math.random();
      setNotifs((prev) => [...prev, { id, message, type, position }]);
      setTimeout(() => {
        setNotifs((prev) => prev.filter((n) => n.id !== id));
      }, 5000);
    },
    []
  );

  const removeNotification = useCallback((id) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="absolute left-1/2 top-5 -translate-x-1/2 space-y-2">
          {notifs
            .filter((n) => n.position === 'center')
            .map((n) => (
              <div
                key={n.id}
                className={`alert alert-${n.type} shadow-md relative`}
              >
                {n.message}
                <button
                  type="button"
                  className="absolute right-2 top-1"
                  onClick={() => removeNotification(n.id)}
                >
                  ✕
                </button>
              </div>
            ))}
        </div>
        <div className="absolute right-5 bottom-5 space-y-2">
          {notifs
            .filter((n) => n.position !== 'center')
            .map((n) => (
              <div
                key={n.id}
                className={`alert alert-${n.type} shadow-md relative`}
              >
                {n.message}
                <button
                  type="button"
                  className="absolute right-2 top-1"
                  onClick={() => removeNotification(n.id)}
                >
                  ✕
                </button>
              </div>
            ))}
        </div>
      </div>
    </NotificationContext.Provider>
  );
}
