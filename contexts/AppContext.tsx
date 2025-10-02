import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from 'react';
import {
  useSession,
  signIn as nextSignIn,
  signOut as nextSignOut,
} from 'next-auth/react';
import { NotificationContext } from './NotificationContext';

import type { UserInfo } from '@lib/types';
import type { AppContextValue } from '../types';
import { Product, Variant, WishlistItem, ShippingInfo } from '@/types';

export const AppContext = createContext<AppContextValue | undefined>(undefined);

function mergeCarts(
  localItems: (Product & { qty: number; variant?: Variant })[],
  serverItems: (Product & { qty: number; variant?: Variant })[]
) {
  const merged = [...localItems];
  for (const item of serverItems) {
    const idx = merged.findIndex(
      (p) =>
        String(p.id) === String(item.id) &&
        (item.variant?.id ? p.variant?.id === item.variant.id : !p.variant?.id)
    );
    if (idx >= 0) {
      merged[idx] = { ...merged[idx], qty: merged[idx].qty + item.qty };
    } else {
      merged.push(item);
    }
  }
  return merged;
}

interface AppProviderProps {
  children: React.ReactNode;
}

const CART_MERGED_KEY = 'app-cart-merged-user';

export function AppProvider({ children }: AppProviderProps) {
  const { data: session } = useSession();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [cart, setCart] = useState<
    (Product & { qty: number; variant?: Variant })[]
  >([]);
  const hasMergedCart = useRef(false);
  const { addNotification } = useContext(NotificationContext);

  useEffect(() => {
    const storedCart = localStorage.getItem('app-cart');
    if (storedCart) {
      const parsed = JSON.parse(storedCart);
      if (Array.isArray(parsed) && parsed.length) {
        setCart((prev) => (prev.length ? prev : parsed));
      }
    }
    const storedWish = localStorage.getItem('app-wishlist');
    if (storedWish) {
      setWishlist(JSON.parse(storedWish));
    }
  }, []);

  useEffect(() => {
    if (!user) {
      hasMergedCart.current = false;
      return;
    }

    if (!hasMergedCart.current) {
      hasMergedCart.current = true;
      const mergedFor = localStorage.getItem(CART_MERGED_KEY);
      const promises: Promise<unknown>[] = [];

      if (mergedFor !== user.email) {
        promises.push(
          fetch('/api/cart')
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => {
              if (Array.isArray(data)) {
                setCart((prev) => {
                  const next = prev.length ? mergeCarts(prev, data) : data;
                  return JSON.stringify(prev) === JSON.stringify(next)
                    ? prev
                    : next;
                });
                localStorage.setItem(CART_MERGED_KEY, user.email);
              }
            })
            .catch(() => {})
        );
      }

      promises.push(
        fetch('/api/user/wishlist')
          .then((res) => (res.ok ? res.json() : []))
          .then((data) => {
            if (Array.isArray(data)) setWishlist(data);
          })
          .catch(() => {})
      );

      Promise.all(promises).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (session?.user) {
      const { email, name, role, brandName, gender, brandId, profileImage } =
        session.user;
      const [firstName = '', lastName = ''] = (name || '').split(' ');
      setUser({
        id: brandId,
        email: email ?? '',
        firstName,
        lastName,
        brandName,
        gender,
        profileImage,
        role: (role || '').toUpperCase(),
        phoneNumber: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      });
    } else {
      setUser(null);
    }
  }, [session]);

  useEffect(() => {
    localStorage.setItem('app-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('app-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (user) {
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      }).catch(() => {});
    }
  }, [cart, user]);

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
    localStorage.removeItem(CART_MERGED_KEY);
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
        (p) => String(p.id) === String(product.id) && (!variant || p.variant?.id === variant.id)
      );
      if (existing) {
        qty = existing.qty + 1;
        return prev.map((p) =>
          String(p.id) === String(product.id) && (!variant || p.variant?.id === variant.id)
            ? { ...p, qty }
            : p
        );
      }
      return [...prev, { ...product, qty, variant }];
    });
    addNotification(`${product.title} added to cart!`, 'success');
  };

  const changeQty = (id: string, delta: number, variantId?: number) => {
    setCart((prev) => {
      const newCart = prev
        .map((item) => {
          // Convert both IDs to strings for comparison
          const itemIdStr = String(item.id);
          const targetIdStr = String(id);
          const shouldUpdate = itemIdStr === targetIdStr && (!variantId || item.variant?.id === variantId);
          return shouldUpdate
            ? { ...item, qty: item.qty + delta }
            : item;
        })
        .filter((item) => item.qty > 0);
      return newCart;
    });
    addNotification('Quantity updated', 'success');
  };

  const removeFromCart = (id: string, variantId?: number) => {
    setCart((prev) => {
      const newCart = prev.filter(
        (item) => {
          // Convert both IDs to strings for comparison
          const itemIdStr = String(item.id);
          const targetIdStr = String(id);
          return !(itemIdStr === targetIdStr && (!variantId || item.variant?.id === variantId));
        }
      );
      return newCart;
    });
    addNotification('Product removed from cart', 'error');
  };

  const clearCart = () => {
    setCart([]);
    addNotification('Cart cleared', 'info');
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

  // Helper function to check if a product is in cart
  const isInCart = (productId: string | number, variantId?: number) => {
    const result = cart.some(
      (item) => 
        String(item.id) === String(productId) && 
        (!variantId || item.variant?.id === variantId)
    );
    return result;
  };

  // Helper function to get cart item quantity
  const getCartItemQuantity = (productId: string | number, variantId?: number) => {
    const item = cart.find(
      (item) => 
        String(item.id) === String(productId) && 
        (!variantId || item.variant?.id === variantId)
    );
    return item?.qty || 0;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        cart: cart as CartItem[],
        wishlist,
        login,
        signup,
        logout,
        addToCart: addToCart as any,
        changeQty,
        removeFromCart,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        placeOrder,
        isInCart,
        getCartItemQuantity,
        mergeCarts: () => {}, // placeholder
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
