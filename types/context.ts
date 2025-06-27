import type { Product } from './product';
import type { Variant } from './variant';
import type { ShippingInfo } from './shipping';
import type { UserInfo } from '../lib/types';

export interface AppContextValue {
  user: UserInfo | null;
  cart: (Product & { qty: number; variant?: Variant })[];
  wishlist: Product[];
  login: (email: string, password: string) => Promise<void>;
  signup: <T>(url: string, payload: Record<string, unknown>) => Promise<T>;
  logout: () => void;
  addToCart: (product: Product, variant?: Variant) => void;
  changeQty: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: string) => void;
  placeOrder: (shipping: ShippingInfo) => Promise<boolean>;
}
