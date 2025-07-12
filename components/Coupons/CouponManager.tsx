import { useEffect, useState } from 'react';
import { TextInput } from '@components/form-fields';
import type { Coupon } from '@/types';
import Link from 'next/link';

interface CouponWithStatus extends Coupon {
  status?: 'unused' | 'used' | 'expired';
  id: number;
  code: string;
  description?: string | null;
  expiresAt?: Date | null;
  discountType: 'percent' | 'fixed';
  discountValue: number;
}

const CouponManager: React.FC = () => {
  const [coupons, setCoupons] = useState<CouponWithStatus[]>([]);
  const [tab, setTab] = useState<'unused' | 'used' | 'expired'>('unused');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/user/coupons')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCoupons(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const filtered = coupons.filter((c) => c.status === tab);

  const applyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!code) return;
    const res = await fetch(`/api/coupons/${encodeURIComponent(code)}`);
    if (res.ok) setMessage({ type: 'success', text: 'Coupon applied' });
    else setMessage({ type: 'error', text: 'Invalid coupon' });
  };

  const tabClass = (value: typeof tab) =>
    `tab tab-bordered ${tab === value ? 'tab-active' : ''}`;

  return (
    <div className="space-y-4">
      <div role="tablist" className="tabs tabs-boxed">
        <a
          role="tab"
          className={tabClass('unused')}
          onClick={() => setTab('unused')}
        >
          Unused
        </a>
        <a
          role="tab"
          className={tabClass('used')}
          onClick={() => setTab('used')}
        >
          Used
        </a>
        <a
          role="tab"
          className={tabClass('expired')}
          onClick={() => setTab('expired')}
        >
          Expired
        </a>
      </div>
      <ul className="space-y-2">
        {filtered.map((c) => (
          <li key={c.id} className="border p-3 rounded flex justify-between">
            <div>
              <p className="font-semibold">{c.code}</p>
              {c.description && <p className="text-sm">{c.description}</p>}
              {c.expiresAt && (
                <p className="text-sm">
                  Expires {new Date(c.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="text-right">
              {c.discountType === 'percent'
                ? `${c.discountValue}% off`
                : `£${c.discountValue} off`}
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="text-center p-6 border rounded">
            <p>You don&apos;t have any coupons or offers available</p>
            <div className="mt-2 space-x-2">
              <Link href="/login" className="btn btn-sm">
                Try signing in with another account
              </Link>
              <Link href="/search?q=coupon" className="btn btn-sm">
                Self-service to find coupon(s)
              </Link>
            </div>
          </li>
        )}
      </ul>
      <form onSubmit={applyCoupon} className="flex gap-2 max-w-sm">
        <TextInput
          name="coupon"
          placeholder="Enter code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1"
        />
        <button className="btn" type="submit">
          Apply
        </button>
      </form>
      {message && (
        <p
          className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
};

export default CouponManager;
