import {
  useContext,
  useState,
  useEffect,
  FormEvent,
  ChangeEvent,
} from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import { AppContext } from '@contexts/AppContext';
import type { AppContextValue } from '../types';
import type { User } from '@/types/user';
import type { Coupon } from '../types';
import {
  TextInput,
  CountrySelect,
  AddressAutocomplete,
} from '@components/form-fields';
import FileUpload from '@components/form-fields/FileUpload';
import Loader from '@components/Loader';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || '';

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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [availableMethods, setAvailableMethods] = useState<{ type: string; details?: string }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [step, setStep] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [loadingUser, setLoadingUser] = useState(false);

  // Load persisted form fields on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user) {
      setName(`${user.firstName} ${user.lastName}`.trim());
      setEmail(user.email);
      setCountry(user.country || '');
      const stored = localStorage.getItem('checkout-form');
      if (stored) {
        try {
          const data = JSON.parse(stored) as Record<string, string>;
          if (data.address) setAddress(data.address);
        } catch {
          // ignore parse errors
        }
      }
    } else {
      const stored = localStorage.getItem('checkout-form');
      if (stored) {
        try {
          const data = JSON.parse(stored) as Record<string, string>;
          if (data.name) setName(data.name);
          if (data.email) setEmail(data.email);
          if (data.address) setAddress(data.address);
          if (data.country) setCountry(data.country);
        } catch {
          // ignore parse errors
        }
      }
    }
  }, [user]);

  // Persist form fields to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const data = { name, email, address, country };
    try {
      localStorage.setItem('checkout-form', JSON.stringify(data));
    } catch {
      // ignore write errors
    }
  }, [name, email, address, country]);

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
  const shippingCost = cart.length > 0 ? 5 : 0;
  const finalTotal = discountedTotal + shippingCost;

  useEffect(() => {
    if (cart.length > 0 && (cart[0] as any).vendor) {
      const methods = (cart[0] as any).vendor.paymentMethods || [];
      setAvailableMethods(methods);
      if (methods.length > 0) setPaymentMethod(methods[0].type);
    }
  }, [cart]);

  useEffect(() => {
    if (!user) return;
    setLoadingUser(true);
    fetch('/api/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        if (data.name) setName(data.name);
        if (data.address) setAddress(data.address);
        if (data.country) setCountry(data.country);
        if (data.email) setEmail(data.email);
      })
      .catch(() => {})
      .finally(() => setLoadingUser(false));
  }, [user]);

  useEffect(() => {
    if (!country) return;
    fetch(`/api/delivery-estimate?country=${country}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((d) => setDeliveryDate(d.date))
      .catch(() => setDeliveryDate(''));
  }, [country]);

  if (cart.length === 0) return <div className="p-4">Your cart is empty.</div>;
  if (loadingUser) return <Loader className="py-8" />;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      if (user) {
        if (paymentMethod === 'stripe') {
          const createRes = await fetch(`${STRAPI_URL}/orders/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              products: cart.map((c) => ({ id: c.id, quantity: c.qty })),
              userId: user.id,
              paymentMethod: 'stripe',
              shippingAddress: { name, address, country },
            }),
          });
          const createData = await createRes.json();
          if (!createRes.ok)
            throw new Error(createData.message || 'Order failed');
          const res = await fetch('/api/checkout/create-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lineItems: createData.lineItems,
              orderId: createData.orderId,
              email: user.email,
              shipping: { name, address },
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
      } else {
        const res = await fetch('/api/guest-orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            address,
            country,
            items: cart,
            total: finalTotal,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Checkout failed');
        router.push(`/confirm?guest=${data.id}`);
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

    {step === 1 && (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name || !address || (!user && !email) || !country) {
            setError('Shipping information required');
            return;
          }
          setError('');
          setStep(2);
        }}
        className="space-y-3"
      >
        <div className="mb-4 max-h-64 overflow-y-auto">
          <ul className="space-y-2">
            {cart.map((item) => {
              const price = parseFloat(typeof item.minPrice === 'number' ? item.minPrice.toString() : item.minPrice || '0');
              const subtotal = price * item.qty;
              return (
                <li key={item.id} className="border p-2 flex justify-between">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm">£{price.toFixed(2)} x {item.qty}</p>
                  </div>
                  <span>£{subtotal.toFixed(2)}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="border-t pt-4">
          <p className="font-semibold">Items: {itemCount}</p>
          <p className="font-semibold">Subtotal: £{totalPrice.toFixed(2)}</p>
        </div>
        <div>
          <label className="label" htmlFor="coupon">Coupon Code</label>
          <div className="flex gap-2">
            <TextInput
              name="coupon"
              id="coupon"
              className="flex-1"
              value={coupon}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCoupon(e.target.value)}
            />
            <button
              type="button"
              className="btn"
              onClick={async () => {
                if (!coupon) return;
                const res = await fetch(`/api/coupons/${encodeURIComponent(coupon)}`);
                if (res.ok) {
                  const data: Coupon = await res.json();
                  if (data.discountType === 'percent') {
                    setDiscount(data.amount);
                  } else if (data.discountType === 'bogo') {
                    if (cart.length >= 2) {
                      const cheapest = Math.min(
                        ...cart.map((item) =>
                          parseFloat(
                            typeof item.minPrice === 'number'
                              ? item.minPrice.toString()
                              : item.minPrice || '0'
                          )
                        )
                      );
                      setDiscount((cheapest / totalPrice) * 100);
                    } else {
                      setDiscount(0);
                    }
                  } else {
                    setDiscount(totalPrice > 0 ? (data.amount / totalPrice) * 100 : 0);
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
            <p className="text-sm text-green-600">Discount {discount}% applied</p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="name">Name</label>
          <TextInput
            name="name"
            id="name"
            className="w-full"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            required
          />
        </div>
        {!user && (
          <div>
            <label className="label" htmlFor="email">Email</label>
            <TextInput
              name="email"
              id="email"
              className="w-full"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              type="email"
            />
          </div>
        )}
        <div>
          <label className="label" htmlFor="address">Address</label>
          <AddressAutocomplete
            value={address}
            onChange={setAddress}
            className="w-full"
          />
        </div>
        <div>
          <CountrySelect value={country} onChange={setCountry} label="Country" />
        </div>
        {deliveryDate && (
          <p className="text-sm">Estimated Delivery: {deliveryDate}</p>
        )}
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex justify-end">
          <button className="btn btn-primary" type="submit">Next</button>
        </div>
      </form>
    )}

    {step === 2 && (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (paymentMethod !== 'stripe' && !paymentReference) {
            setError('Payment reference required');
            return;
          }
          setError('');
          setStep(3);
        }}
        className="space-y-3"
      >
        <div>
          <label className="label" htmlFor="paymentMethod">Payment Method</label>
          {availableMethods.length > 0 ? (
            <select
              id="paymentMethod"
              className="select select-bordered w-full"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {availableMethods.map((m) => (
                <option key={m.type} value={m.type}>
                  {m.type === 'card' || m.type === 'stripe'
                    ? 'Credit/Debit Card'
                    : m.type === 'jazzcash'
                    ? 'JazzCash'
                    : m.type === 'bank_transfer'
                    ? 'Bank Transfer'
                    : m.type}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm">No payment methods available.</p>
          )}
        </div>
        {paymentMethod !== 'stripe' && paymentMethod !== 'card' && (
          <div className="border p-3 rounded space-y-2">
            {paymentMethod === 'jazzcash' && (
              <p>Send payment to JazzCash account <b>0300-7654321</b> and enter the transaction ID below.</p>
            )}
            {paymentMethod === 'bank_transfer' && (
              <p>Transfer to Bank Account <b>PK00 TEST 1234 5678 9012 3456</b> and provide reference.</p>
            )}
            <TextInput
              name="reference"
              id="reference"
              placeholder="Transaction / Reference ID"
              className="w-full"
              value={paymentReference}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPaymentReference(e.target.value)}
            />
            <FileUpload
              name="proof"
              label="Upload Payment Proof (optional)"
              onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
            />
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex justify-between">
          <button type="button" className="btn" onClick={() => setStep(1)}>
            Back
          </button>
          <button className="btn btn-primary" type="submit">Next</button>
        </div>
      </form>
    )}

    {step === 3 && (
      <div className="space-y-4">
        <div className="mb-4 max-h-64 overflow-y-auto">
          <ul className="space-y-2">
            {cart.map((item) => {
              const price = parseFloat(typeof item.minPrice === 'number' ? item.minPrice.toString() : item.minPrice || '0');
              const subtotal = price * item.qty;
              return (
                <li key={item.id} className="border p-2 flex justify-between">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm">£{price.toFixed(2)} x {item.qty}</p>
                  </div>
                  <span>£{subtotal.toFixed(2)}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="border-t pt-4 space-y-1">
          <p className="font-semibold">Subtotal: £{totalPrice.toFixed(2)}</p>
          <p className="font-semibold">Discount: {discount}%</p>
          <p className="font-semibold">Shipping: £{shippingCost.toFixed(2)}</p>
          <p className="font-semibold">Total: £{finalTotal.toFixed(2)}</p>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex justify-between">
          <button type="button" className="btn" onClick={() => setStep(2)}>
            Back
          </button>
          <button type="button" className="btn btn-primary" onClick={submit}>
            Confirm Order
          </button>
        </div>
      </div>
    )}
  </div>
  );
};

export default Checkout;
