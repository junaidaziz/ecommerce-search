import { useContext, useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AppContext, AppContextValue } from '../contexts/AppContext';
import type { User } from '../types/user';
import type { Coupon } from '../types';

// Types for cart item and user
type CartItem = {
  id: string | number;
  title: string;
  minPrice?: string;
  qty: number;
};

type AppContextType = {
  cart: CartItem[];
  user: User | null;
};

const Checkout: React.FC = () => {
  const router = useRouter();
  const context = useContext<AppContextValue | undefined>(AppContext);
  const cart = context?.cart ?? [];
  const user = context?.user ?? null;
  const [name, setName] = useState(
    user ? `${user.firstName} ${user.lastName}` : ''
  );
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);

  const itemCount = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce(
    (s, i) =>
      s +
      i.qty *
        parseFloat(
          typeof i.minPrice === 'number'
            ? i.minPrice.toString()
            : i.minPrice || '0'
        ),
    0
  );
  const discountedTotal = totalPrice * (1 - discount / 100);

  if (!user)
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center justify-center text-center space-y-4 py-10">
        <p className="text-lg">Please log in to checkout.</p>
        <Link href="/login" className="btn btn-primary">
          Login
        </Link>
      </div>
    );
  if (cart.length === 0) return <div className="p-4">Your cart is empty.</div>;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          email: user.email,
          shipping: { name, address },
          discount,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Checkout failed');
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message || 'Order failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Checkout</h1>
      <div className="mb-4 max-h-64 overflow-y-auto">
        <ul className="space-y-2">
          {cart.map((item) => {
            const price = parseFloat(
              typeof item.minPrice === 'number'
                ? item.minPrice.toString()
                : item.minPrice || '0'
            );
            const subtotal = price * item.qty;
            return (
              <li key={item.id} className="border p-2 flex justify-between">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm">
                    £{price.toFixed(2)} x {item.qty}
                  </p>
                </div>
                <span>£{subtotal.toFixed(2)}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="border-t pt-4 mb-4 flex justify-between">
        <p className="font-semibold">Items: {itemCount}</p>
        <p className="font-semibold">Total: £{discountedTotal.toFixed(2)}</p>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="label" htmlFor="coupon">
            Coupon Code
          </label>
          <div className="flex gap-2">
            <input
              id="coupon"
              className="input input-bordered flex-1"
              value={coupon}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setCoupon(e.target.value)
              }
            />
            <button
              type="button"
              className="btn"
              onClick={async () => {
                if (!coupon) return;
                const res = await fetch(
                  `/api/coupons/${encodeURIComponent(coupon)}`
                );
                if (res.ok) {
                  const data: Coupon = await res.json();
                  if (data.discountType === 'percent') {
                    setDiscount(data.value);
                  } else {
                    setDiscount(
                      totalPrice > 0 ? (data.value / totalPrice) * 100 : 0
                    );
                  }
                } else {
                  setDiscount(0);
                }
              }}
            >
              Apply
            </button>
          </div>
          {discount > 0 && (
            <p className="text-sm text-green-600">
              Discount {discount}% applied
            </p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className="input input-bordered w-full"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="address">
            Address
          </label>
          <textarea
            id="address"
            className="textarea textarea-bordered w-full"
            value={address}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setAddress(e.target.value)
            }
            required
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button className="btn btn-primary" type="submit">
          Place Order
        </button>
      </form>
    </div>
  );
};

export default Checkout;
