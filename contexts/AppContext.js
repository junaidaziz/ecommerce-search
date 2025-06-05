import { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('app-state');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed.user || null);
      setCart(parsed.cart || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('app-state', JSON.stringify({ user, cart }));
  }, [user, cart]);

  const login = async (email, password) => {
    const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    if (!res.ok) throw new Error('Login failed');
    setUser({ email });
  };

  const signup = async (email, password) => {
    const res = await fetch('/api/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    if (!res.ok) throw new Error('Signup failed');
    setUser({ email });
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(p => p.ID === product.ID);
      if (existing) {
        return prev.map(p => p.ID === product.ID ? { ...p, qty: p.qty + 1 } : p);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  return (
    <AppContext.Provider value={{ user, cart, login, signup, addToCart }}>
      {children}
    </AppContext.Provider>
  );
}
