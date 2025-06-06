import { createContext, useState, useEffect } from 'react';
import { useSession, signIn as nextSignIn, signOut as nextSignOut } from 'next-auth/react';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('app-cart');
    if (stored) {
      setCart(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      const { email, name, role, brandName, gender } = session.user;
      const [firstName = '', lastName = ''] = (name || '').split(' ');
      setUser({ email, firstName, lastName, brandName, gender, role });
    } else {
      setUser(null);
    }
  }, [session]);

  useEffect(() => {
    localStorage.setItem('app-cart', JSON.stringify(cart));
  }, [cart]);

  const login = async (email, password) => {
    const res = await nextSignIn('credentials', {
      redirect: false,
      email,
      password
    });
    if (res?.error) throw new Error('Login failed');
  };

  const signup = async (payload) => {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Signup failed');
    const data = await res.json();
    return data;
  };

  const logout = () => {
    nextSignOut({ redirect: false });
  };

  const placeOrder = async () => {
    if (!user || cart.length === 0) return;
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, items: cart, total: cart.reduce((s,i)=>s+i.qty*parseFloat(i.MIN_PRICE||0),0) })
    });
    setCart([]);
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

  const changeQty = (id, delta) => {
    setCart(prev => {
      return prev
        .map(item =>
          item.ID === id ? { ...item, qty: item.qty + delta } : item
        )
        .filter(item => item.qty > 0);
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.ID !== id));
  };

  return (
    <AppContext.Provider value={{ user, cart, login, signup, logout, addToCart, changeQty, removeFromCart, placeOrder }}>
      {children}
    </AppContext.Provider>
  );
}

