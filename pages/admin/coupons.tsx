import { useEffect, useState, useContext, ChangeEvent } from 'react';
import Head from 'next/head';
import { AppContext } from '@contexts/AppContext';
import { TextInput } from '@components/form-fields';
import type { Coupon } from '@/types';
import { getPageTitle } from '@lib/pageTitle';

export default function AdminCoupons() {
  const { user } = useContext(AppContext)!;
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState<Partial<Coupon>>({
    code: '',
    discountType: 'percent',
    amount: 0,
    minOrderValue: undefined,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const fetchCoupons = () => {
    fetch('/api/admin/coupons')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: Coupon[]) => setCoupons(data))
      .catch(() => setCoupons([]));
  };

  useEffect(() => {
    if (user) fetchCoupons();
  }, [user]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const body = { ...form, id: editingId ?? undefined };
    const res = await fetch('/api/admin/coupons', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setMessage(editingId ? 'Coupon updated' : 'Coupon created');
      setForm({ code: '', discountType: 'percent', amount: 0, minOrderValue: undefined });
      setEditingId(null);
      fetchCoupons();
    } else {
      setMessage('Error saving coupon');
    }
  };

  if (!user) return <div className="p-4">Please log in.</div>;
  if (user.role !== 'super-admin')
    return <div className="p-4">Admin access required.</div>;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <Head>
        <title>{getPageTitle('Manage Coupons')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Coupons</h1>
      {message && <div className="mb-2 text-green-600">{message}</div>}
      <form onSubmit={submit} className="space-y-2 max-w-md">
        <TextInput
          name="code"
          value={form.code}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setForm((f) => ({ ...f, code: e.target.value }))
          }
          placeholder="CODE"
        />
        <select
          className="select select-bordered w-full"
          value={form.discountType}
          onChange={(e) =>
            setForm((f) => ({
                ...f,
                discountType: e.target.value as 'percent' | 'amount' | 'bogo',
              }))
          }
        >
            <option value="percent">Percent</option>
            <option value="amount">Amount</option>
            <option value="bogo">BOGO</option>
        </select>
        <TextInput
          name="amount"
          type="number"
          value={String(form.amount)}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setForm((f) => ({ ...f, amount: parseFloat(e.target.value) }))
          }
          placeholder="Amount"
        />
        <TextInput
          name="minOrderValue"
          type="number"
          value={form.minOrderValue ? String(form.minOrderValue) : ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setForm((f) => ({ ...f, minOrderValue: parseFloat(e.target.value) }))
          }
          placeholder="Min Order Value"
        />
        <TextInput
          name="expirationDate"
          type="date"
          value={form.expirationDate?.slice(0, 10) || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setForm((f) => ({ ...f, expirationDate: e.target.value }))
          }
        />
        <TextInput
          name="usageLimit"
          type="number"
          value={form.usageLimit ? String(form.usageLimit) : ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setForm((f) => ({ ...f, usageLimit: parseInt(e.target.value, 10) }))
          }
          placeholder="Usage Limit"
        />
        <div className="flex gap-2">
          {editingId && (
            <button
              type="button"
              className="btn"
              onClick={() => {
                setEditingId(null);
                setForm({ code: '', discountType: 'percent', amount: 0, minOrderValue: undefined });
              }}
            >
              Cancel
            </button>
          )}
          <button className="btn btn-primary" type="submit">
            {editingId ? 'Update' : 'Create'} Coupon
          </button>
        </div>
      </form>
      <h2 className="text-xl font-semibold mt-6 mb-2">Existing Coupons</h2>
      <table className="table w-full">
        <thead>
          <tr>
            <th>Code</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Min Order</th>
            <th>Used</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((c) => (
            <tr key={c.id} className="hover">
              <td>{c.code}</td>
              <td>{c.discountType}</td>
              <td>{c.amount}</td>
              <td>{c.minOrderValue ?? '-'}</td>
              <td>{c.usedCount}</td>
              <td>
                <button
                  className="btn btn-sm mr-2"
                  onClick={() => {
                    setEditingId(Number(c.id));
                    setForm({
                      code: c.code,
                      discountType: c.discountType,
                      amount: c.amount,
                      minOrderValue: c.minOrderValue,
                      expirationDate: c.expirationDate,
                      usageLimit: c.usageLimit,
                    });
                  }}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
