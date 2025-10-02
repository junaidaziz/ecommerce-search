import { apiFetch } from '@lib/api';
import { useContext, useState, useEffect, FormEvent, ChangeEvent, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import { AppContext } from '@contexts/AppContext';
import type { AppContextValue } from '../types';
import type { User, Coupon } from '@/types';
import {
  TextInput,
  CountrySelect,
  AddressAutocomplete,
} from '@components/form-fields';
import FileUpload from '@components/form-fields/FileUpload';
import Loader from '@components/Loader';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

async function parseJsonSafe<T>(res: Response): Promise<T> {
  try {
    return await res.json();
  } catch (err) {
    const text = await res.text();
    console.error('Failed to parse JSON:', text);
    throw err;
  }
}

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
  const cart = useMemo(() => context?.cart ?? [], [context?.cart]);
  const user = context?.user ?? null;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponStatus, setCouponStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [availableMethods, setAvailableMethods] = useState<
    { type: string; details?: string }[]
  >([]);
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
    apiFetch('/api/me')
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
    apiFetch(`/api/delivery-estimate?country=${country}`)
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
          if (!STRAPI_URL) throw new Error('STRAPI_URL not configured');
          const createRes = await apiFetch(`${STRAPI_URL}/orders/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              products: cart.map((c) => ({ id: c.id, quantity: c.qty })),
              userId: user.id,
              paymentMethod: 'stripe',
              shippingAddress: { name, address, country },
            }),
          });
          const createData = (await parseJsonSafe(createRes)) as {
            lineItems: any;
            orderId: any;
            [key: string]: any;
          };
          if (!createRes.ok)
            throw new Error(
              typeof createData === 'object' &&
              createData !== null &&
              'message' in createData
                ? (createData as { message?: string }).message
                : 'Order failed'
            );
          const res = await apiFetch('/api/checkout/create-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lineItems: createData.lineItems,
              orderId: createData.orderId,
              email: user.email,
              shipping: { name, address },
            }),
          });
          const data = await parseJsonSafe(res);
          if (!res.ok) {
            const errorMsg =
              typeof data === 'object' && data !== null && 'message' in data
                ? (data as { message?: string }).message
                : undefined;
            throw new Error(errorMsg || 'Checkout failed');
          }
          if (
            typeof data === 'object' &&
            data !== null &&
            'url' in data &&
            typeof (data as any).url === 'string'
          ) {
            window.location.href = (data as { url: string }).url;
          } else {
            throw new Error('Invalid response from checkout session');
          }
        } else {
          const fd = new FormData();
          fd.append('email', user.email);
          fd.append('items', JSON.stringify(cart));
          fd.append('total', discountedTotal.toString());
          fd.append('paymentMethod', paymentMethod);
          if (paymentReference) fd.append('paymentReference', paymentReference);
          if (paymentProof) fd.append('paymentProof', paymentProof);
          const res = await apiFetch('/api/orders', {
            method: 'POST',
            body: fd,
          });
          const data = await parseJsonSafe(res);
          if (!res.ok) {
            const errorMsg =
              typeof data === 'object' && data !== null && 'message' in data
                ? (data as { message?: string }).message
                : undefined;
            throw new Error(errorMsg || 'Checkout failed');
          }
          router.push('/orders');
        }
      } else {
        const res = await apiFetch('/api/guest-orders', {
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
        const data = await parseJsonSafe(res);
        if (!res.ok) {
          const errorMsg =
            typeof data === 'object' && data !== null && 'message' in data
              ? (data as { message?: string }).message
              : undefined;
          throw new Error(errorMsg || 'Checkout failed');
        }
        router.push(`/confirm?guest=${(data as { id: string }).id}`);
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
          <div className="border-t pt-4">
            <p className="font-semibold">Items: {itemCount}</p>
            <p className="font-semibold">Subtotal: £{totalPrice.toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="coupon">
              Have a Coupon Code?
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <TextInput
                  name="coupon"
                  id="coupon"
                  className={`w-full ${
                    couponStatus === 'valid'
                      ? 'border-green-500 focus:ring-green-500'
                      : couponStatus === 'invalid'
                        ? 'border-red-500 focus:ring-red-500'
                        : ''
                  }`}
                  value={coupon}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setCoupon(e.target.value.toUpperCase());
                    setCouponStatus('idle');
                    setCouponMessage('');
                  }}
                  placeholder="Enter coupon code"
                />
                {couponStatus === 'valid' && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {couponStatus === 'invalid' && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={!coupon.trim()}
                onClick={async () => {
                  if (!coupon.trim()) return;
                  setCouponMessage('');
                  setCouponStatus('idle');
                  
                  try {
                    const res = await apiFetch(
                      `/api/coupons/${encodeURIComponent(coupon)}`
                    );
                    
                    if (res.ok) {
                      const data: Coupon = await parseJsonSafe(res);
                      
                      // Check minimum order value
                      if (data.minOrderValue && totalPrice < data.minOrderValue) {
                        setCouponStatus('invalid');
                        setCouponMessage(`Minimum order value of £${data.minOrderValue.toFixed(2)} required`);
                        setDiscount(0);
                        return;
                      }
                      
                      if (data.discountType === 'percent') {
                        setDiscount(data.discountValue);
                        setCouponStatus('valid');
                        setCouponMessage(`${data.discountValue}% discount applied!`);
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
                          setCouponStatus('valid');
                          setCouponMessage('Buy one get one discount applied!');
                        } else {
                          setCouponStatus('invalid');
                          setCouponMessage('This coupon requires at least 2 items in cart');
                          setDiscount(0);
                        }
                      } else {
                        const discountPercent = totalPrice > 0
                          ? (data.discountValue / totalPrice) * 100
                          : 0;
                        setDiscount(discountPercent);
                        setCouponStatus('valid');
                        setCouponMessage(`£${data.discountValue.toFixed(2)} discount applied!`);
                      }
                    } else {
                      const errorData = await res.json().catch(() => ({}));
                      setCouponStatus('invalid');
                      setCouponMessage(errorData.message || 'Invalid or expired coupon code');
                      setDiscount(0);
                    }
                  } catch (err) {
                    setCouponStatus('invalid');
                    setCouponMessage('Failed to validate coupon. Please try again.');
                    setDiscount(0);
                  }
                }}
              >
                Apply
              </button>
            </div>
            {couponMessage && (
              <div className={`mt-2 p-2 rounded-md text-sm ${
                couponStatus === 'valid'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {couponMessage}
              </div>
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
          {!user && (
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <TextInput
                name="email"
                id="email"
                className="w-full"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                required
                type="email"
              />
            </div>
          )}
          <div>
            <label className="label" htmlFor="address">
              Address
            </label>
            <AddressAutocomplete
              value={address}
              onChange={setAddress}
              className="w-full"
            />
          </div>
          <div>
            <CountrySelect
              value={country}
              onChange={setCountry}
              label="Country"
            />
          </div>
          {deliveryDate && (
            <p className="text-sm">Estimated Delivery: {deliveryDate}</p>
          )}
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-end">
            <button className="btn btn-primary" type="submit">
              Next
            </button>
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
            <label className="label" htmlFor="paymentMethod">
              Payment Method
            </label>
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
                <p>
                  Send payment to JazzCash account <b>0300-7654321</b> and enter
                  the transaction ID below.
                </p>
              )}
              {paymentMethod === 'bank_transfer' && (
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
          <div className="flex justify-between">
            <button type="button" className="btn" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="btn btn-primary" type="submit">
              Next
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="space-y-4">
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
          <div className="border-t pt-4 space-y-1">
            <p className="font-semibold">Subtotal: £{totalPrice.toFixed(2)}</p>
            <p className="font-semibold">Discount: {discount}%</p>
            <p className="font-semibold">
              Shipping: £{shippingCost.toFixed(2)}
            </p>
            <p className="font-semibold">Total: £{finalTotal.toFixed(2)}</p>
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-between">
            <button type="button" className="btn" onClick={() => setStep(2)}>
              Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => submit(new Event('submit') as any)}
            >
              Confirm Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
