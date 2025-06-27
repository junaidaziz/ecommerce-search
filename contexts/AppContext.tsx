import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  useSession,
  signIn as nextSignIn,
  signOut as nextSignOut,
} from 'next-auth/react';
import { NotificationContext } from './NotificationContext';

import type { UserInfo } from '@lib/types';
import type { AppContextValue } from '../types';
import { Product } from '@types/product';
import { Variant } from '@types/variant';
import type { ShippingInfo } from '@types/shipping';
import type { WishlistItem } from '@types/wishlist';

export const AppContext = createContext<AppContextValue | undefined>(undefined);

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const { data: session } = useSession();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [cart, setCart] = useState<
    (Product & { qty: number; variant?: Variant })[]
  >([]);
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
    fetch('/api/user/wishlist')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setWishlist(data);
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (session?.user) {
      const { email, name, role, brandName, gender, brandId } = session.user;
      const [firstName = '', lastName = ''] = (name || '').split(' ');
      setUser({
        id: brandId,
        email: email ?? '',
        firstName,
        lastName,
        brandName,
        gender,
        role: (role || '').toLowerCase(),
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
    addNotification(
      'Signup successful! Please check your email to verify your account before logging in.',
      'success'
    );
    return data;
  };

  const logout = (): void => {
    nextSignOut({ callbackUrl: '/', redirect: true });
    addNotification('Logged out', 'info');
  };

  const placeOrder = async (shipping: ShippingInfo): Promise<boolean> => {
    if (!user || cart.length === 0) return false;
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        items: cart,
        total: cart.reduce((s, i) => s + i.qty * (i.minPrice || 0), 0),
        shipping,
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

  const addToCart = (product: Product, variant?: Variant) => {
    let qty = 1;
    setCart((prev) => {
      const existing = prev.find(
        (p) => p.id === product.id && (!variant || p.variant?.id === variant.id)
      );
      if (existing) {
        qty = existing.qty + 1;
        return prev.map((p) =>
          p.id === product.id && (!variant || p.variant?.id === variant.id)
            ? { ...p, qty }
            : p
        );
      }
      return [...prev, { ...product, qty, variant }];
    });
    addNotification(
      `✅ ${product.title} added to cart!`,
      'success',
      'top-right'
    );
  };

  const changeQty = (id: string, delta: number, variantId?: number) => {
    setCart((prev) => {
      return prev
        .map((item) =>
          item.id === id && (!variantId || item.variant?.id === variantId)
            ? { ...item, qty: item.qty + delta }
            : item
        )
        .filter((item) => item.qty > 0);
    });
  };

  const removeFromCart = (id: string, variantId?: number) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(item.id === id && (!variantId || item.variant?.id === variantId))
      )
    );
    addNotification('Removed from cart', 'info');
  };

  const addToWishlist = (product: Product, notifyOnStock = false) => {
    setWishlist((prev) => {
      if (prev.find((p) => p.product.id === product.id)) return prev;
      const temp: WishlistItem = {
        id: Date.now(),
        userId: 0,
        productId: product.id,
        variantId: null,
        notifyOnStock,
        createdAt: new Date(),
        product,
      };
      return [...prev, temp];
    });
    if (user) {
      fetch('/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, notifyOnStock }),
      })
        .then((res) => res.json())
        .then((item) => {
          setWishlist((prev) =>
            prev.map((w) =>
              w.product.id === product.id ? { ...w, id: item.id } : w
            )
          );
        })
        .catch(() => {});
    }
    addNotification('Added to wishlist', 'success');
  };

  const removeFromWishlist = (productId: string | number) => {
    const item = wishlist.find((w) => w.product.id === productId);
    if (item && user) {
      fetch(`/api/user/wishlist/${item.id}`, { method: 'DELETE' }).catch(
        () => {}
      );
    }
    setWishlist((prev) => prev.filter((w) => w.product.id !== productId));
    addNotification('Removed from wishlist', 'warning');
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
