import type { Product } from './product';
import type { Variant } from './variant';
import type { ShippingInfo } from './shipping';
import type { User } from './user';
import type { WishlistItem } from './wishlist';
import type { CartItem } from './cart';

// App context value interface
export interface AppContextValue {
  user: User | null;
  wishlist: WishlistItem[];
  cart: CartItem[];
  login: (email: string, password: string) => Promise<void>;
  signup: <T>(url: string, payload: Record<string, unknown>) => Promise<T>;
  logout: () => void;
  addToCart: (product: Product, quantity?: number, variantId?: string) => void;
  changeQty: (productId: number, delta: number, variantId?: string) => void;
  removeFromCart: (productId: number, variantId?: string) => void;
  clearCart: () => void;
  addToWishlist: (product: Product, notifyOnStock?: boolean) => void;
  removeFromWishlist: (productId: number) => void;
  placeOrder: (shipping: ShippingInfo) => Promise<boolean>;
  isInCart: (productId: number, variantId?: string) => boolean;
  getCartItemQuantity: (productId: number, variantId?: string) => number;
  mergeCarts: (serverCart: CartItem[]) => void;
}

// Theme context interface
export interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

// Notification context interface
export interface NotificationContextValue {
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }>;
  addNotification: (notification: {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Chat context interface
export interface ChatContextValue {
  messages: Array<{
    id: number;
    content: string;
    senderId: number;
    receiverId: number;
    orderId: number;
    messageType: 'text' | 'image' | 'file';
    createdAt: Date;
    seen: boolean;
  }>;
  sendMessage: (message: {
    content: string;
    receiverId: number;
    orderId: number;
    messageType?: 'text' | 'image' | 'file';
  }) => Promise<void>;
  markAsSeen: (messageId: number) => void;
}
