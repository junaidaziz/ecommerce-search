import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  useSession,
  signIn as nextSignIn,
  signOut as nextSignOut,
} from 'next-auth/react';
import { NotificationContext } from './NotificationContext';

import type { UserInfo } from '../lib/types';
import { Product } from '../types/product';

export interface AppContextValue {
  user: UserInfo | null;
  cart: (Product & { qty: number })[];
  wishlist: Product[];
  login: (email: string, password: string) => Promise<void>;
  signup: <T>(url: string, payload: Record<string, unknown>) => Promise<T>;
  logout: () => void;
  addToCart: (product: Product) => void;
  changeQty: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: string) => void;
  placeOrder: (payload: {
    shippingName: string;
    shippingAddress: string;
  }) => Promise<boolean>;
}

export const AppContext = createContext<AppContextValue | undefined>(undefined);

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const { data: session } = useSession();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [cart, setCart] = useState<(Product & { qty: number })[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const { addNotification } = useContext(NotificationContext);

  useEffect(() => {
    const stored = localStorage.getItem('app-cart');
    if (stored) {
      setCart(JSON.parse(stored));
    }
    const storedWish = localStorage.getItem('app-wishlist');
    if (storedWish) {
      setWishlist(JSON.parse(storedWish));
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch('/api/cart')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setCart(data);
      })
      .catch(() => {});
    fetch('/api/wishlist')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setWishlist(data);
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (session?.user) {
      const u = session.user as UserInfo & {
        role?: string;
        brandName?: string;
        name?: string | null;
        gender?: string;
      };
      const { email, name, role, brandName, gender } = u;
      const [firstName = '', lastName = ''] = (name || '').split(' ');
      setUser({
        email: email ?? '',
        firstName,
        lastName,
        brandName,
        gender,
        role,
        phoneNumber: '',
        address: '',
        city: '',
        country: '',
      });
    } else {
      setUser(null);
    }
  }, [session]);

  useEffect(() => {
    localStorage.setItem('app-cart', JSON.stringify(cart));
    localStorage.setItem('app-wishlist', JSON.stringify(wishlist));
    if (user) {
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      }).catch(() => {});
      fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: wishlist }),
      }).catch(() => {});
    }
  }, [cart, wishlist, user]);

  const login = async (email: string, password: string): Promise<void> => {
    const res = await nextSignIn('credentials', {
      redirect: false,
      email,
      password,
    });
    if (res?.error) {
      addNotification('Login failed', 'error');
      throw new Error('Login failed');
    }
    addNotification('Logged in', 'success');
  };

  const signup = async <T,>(
    url: string,
    payload: Record<string, unknown>
  ): Promise<T> => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      addNotification('Signup failed', 'error');
      throw new Error('Signup failed');
    }
    const data: T = await res.json();
    addNotification('Signup successful', 'success');
    return data;
  };

  const logout = (): void => {
    nextSignOut({ redirect: false });
    addNotification('Logged out', 'info');
  };

  const placeOrder = async ({ shippingName, shippingAddress }: { shippingName: string; shippingAddress: string }): Promise<boolean> => {
    if (!user || cart.length === 0) return false;
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        items: cart,
        total: cart.reduce(
          (s, i) => s + i.qty * (i.minPrice || 0),
          0
        ),
        shippingName,
        shippingAddress,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      addNotification(data?.message || 'Order failed', 'error');
      throw new Error(data?.message || 'Order failed');
    }
    setCart([]);
    addNotification('Order placed', 'success');
    return true;
  };

  const addToCart = (product: Product) => {
    let qty = 1;
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        qty = existing.qty + 1;
        return prev.map((p) => (p.id === product.id ? { ...p, qty } : p));
      }
      return [...prev, { ...product, qty }];
    });
    addNotification(`Added ${product.title} (x${qty}) to cart`, 'success', 'center');
  };

  const changeQty = (id: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0);
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    addNotification('Removed from cart', 'info');
  };

  const addToWishlist = (product: Product) => {
    setWishlist((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
    addNotification('Added to wishlist', 'success');
  };

  const removeFromWishlist = (id: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
    addNotification('Removed from wishlist', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        cart,
        wishlist,
        login,
        signup,
        logout,
        addToCart,
        changeQty,
        removeFromCart,
        addToWishlist,
        removeFromWishlist,
        placeOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
