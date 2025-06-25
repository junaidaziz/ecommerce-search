import { useContext, useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { getPageTitle } from '../lib/pageTitle';
import { AppContext, AppContextValue } from '../contexts/AppContext';
import type { User } from '../types/user';
import type { Coupon } from '../types';
import { TextInput, Textarea } from '../components/form-fields';
import FileUpload from '../components/form-fields/FileUpload';

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
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);

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
      if (paymentMethod === 'card') {
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
      } else {
        const fd = new FormData();
        fd.append('email', user.email);
        fd.append('items', JSON.stringify(cart));
        fd.append('total', discountedTotal.toString());
        fd.append('paymentMethod', paymentMethod);
        if (paymentReference) fd.append('paymentReference', paymentReference);
        if (paymentProof) fd.append('paymentProof', paymentProof);
        const res = await fetch('/api/orders', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Checkout failed');
        router.push('/orders');
      }
    } catch (e: any) {
      setError(e.message || 'Order failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Head>
        <title>{getPageTitle('Checkout')}</title>
      </Head>
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
            <TextInput
              name="coupon"
              id="coupon"
              className="flex-1"
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
          <TextInput
            name="name"
            id="name"
            className="w-full"
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
          <Textarea
            name="address"
            id="address"
            className="w-full"
            value={address}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setAddress(e.target.value)
            }
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="paymentMethod">
            Payment Method
          </label>
          <select
            id="paymentMethod"
            className="select select-bordered w-full"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="card">Credit/Debit Card</option>
            <option value="easypaisa">EasyPaisa</option>
            <option value="jazzcash">JazzCash</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>
        {paymentMethod !== 'card' && (
          <div className="border p-3 rounded space-y-2">
            {paymentMethod === 'easypaisa' && (
              <p>
                Send payment to EasyPaisa account <b>0300-1234567</b> and enter
                the transaction ID below.
              </p>
            )}
            {paymentMethod === 'jazzcash' && (
              <p>
                Send payment to JazzCash account <b>0300-7654321</b> and enter
                the transaction ID below.
              </p>
            )}
            {paymentMethod === 'bank' && (
              <p>
                Transfer to Bank Account <b>PK00 TEST 1234 5678 9012 3456</b>{' '}
                and provide reference.
              </p>
            )}
            <TextInput
              name="reference"
              id="reference"
              placeholder="Transaction / Reference ID"
              className="w-full"
              value={paymentReference}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPaymentReference(e.target.value)
              }
            />
            <FileUpload
              name="proof"
              label="Upload Payment Proof (optional)"
              onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
            />
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
        <button className="btn btn-primary" type="submit">
          Place Order
        </button>
      </form>
    </div>
  );
};

export default Checkout;
