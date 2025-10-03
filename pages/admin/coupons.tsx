import { apiFetch } from '@lib/api';
import { fetchJsonSafe } from '@utils/fetchJson';
import { useEffect, useState, useContext, ChangeEvent } from 'react';
import Head from 'next/head';
import { AppContext } from '@contexts/AppContext';
import { TextInput } from '@components/form-fields';
import { Coupon, UserRole, USER_ROLES } from '@/types';
import { getPageTitle } from '@lib/pageTitle';
import PageHero from '@components/UI/PageHero';
import { toast } from 'sonner';

export default function AdminCoupons() {
  const { user } = useContext(AppContext)!;
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState<Partial<Coupon>>({
    code: '',
    discountType: 'percent',
    discountValue: 0,
    minOrderValue: undefined,
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchCoupons = () => {
    fetchJsonSafe<Coupon[]>('/api/admin/coupons', [])
      .then((data) => setCoupons(data));
  };

  useEffect(() => {
    if (user) fetchCoupons();
  }, [user]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const body = { ...form, id: editingId ?? undefined };
    try {
      const res = await apiFetch('/api/admin/coupons', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(editingId ? 'Coupon updated successfully' : 'Coupon created successfully');
        setForm({
          code: '',
          discountType: 'percent',
          discountValue: 0,
          minOrderValue: undefined,
        });
        setEditingId(null);
        fetchCoupons();
      } else {
        toast.error('Failed to save coupon');
      }
    } catch (error) {
      toast.error('Failed to save coupon');
    }
  };

  if (!user) return <div className="p-4">Please log in.</div>;
  if (user.role.toUpperCase() !== USER_ROLES.SUPER_ADMIN)
    return <div className="p-4">Admin access required.</div>;

  return (
    <>
      <Head>
        <title>{getPageTitle('Manage Coupons')}</title>
      </Head>
      <PageHero heading="Coupons" />
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <form onSubmit={submit} className="space-y-2 max-w-md bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <TextInput
          name="code"
          value={form.code}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setForm((f: Partial<Coupon>) => ({ ...f, code: e.target.value }))
          }
          placeholder="CODE"
        />
        <select
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent"
          value={form.discountType}
          onChange={(e) =>
            setForm((f: Partial<Coupon>) => ({
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
          name="discountValue"
          type="number"
          value={String(form.discountValue)}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setForm((f: Partial<Coupon>) => ({
              ...f,
              discountValue: parseFloat(e.target.value),
            }))
          }
          placeholder="Discount Value"
        />
        <TextInput
          name="minOrderValue"
          type="number"
          value={form.minOrderValue ? String(form.minOrderValue) : ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setForm((f: Partial<Coupon>) => ({
              ...f,
              minOrderValue: parseFloat(e.target.value),
            }))
          }
          placeholder="Min Order Value"
        />
        <TextInput
          name="expiresAt"
          type="date"
          value={form.expiresAt?.slice(0, 10) || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setForm((f: Partial<Coupon>) => ({ ...f, expiresAt: e.target.value }))
          }
        />
        <TextInput
          name="usageLimit"
          type="number"
          value={form.usageLimit ? String(form.usageLimit) : ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setForm((f: Partial<Coupon>) => ({ ...f, usageLimit: parseInt(e.target.value, 10) }))
          }
          placeholder="Usage Limit"
        />
        <div className="flex gap-2">
          {editingId && (
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              onClick={() => {
                setEditingId(null);
                setForm({
                  code: '',
                  discountType: 'percent',
                  discountValue: 0,
                  minOrderValue: undefined,
                });
              }}
            >
              Cancel
            </button>
          )}
          <button className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors" type="submit">
            {editingId ? 'Update' : 'Create'} Coupon
          </button>
        </div>
      </form>
      <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900 dark:text-gray-100">Existing Coupons</h2>
      <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Discount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Min Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Used</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{c.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{c.discountType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{c.discountValue}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{c.minOrderValue ?? '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{c.usedCount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    className="px-3 py-1 text-sm font-medium text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary"
                    onClick={() => {
                      setEditingId(Number(c.id));
                      setForm({
                        code: c.code,
                        discountType: c.discountType,
                        discountValue: c.discountValue,
                        minOrderValue: c.minOrderValue,
                        expiresAt: c.expiresAt,
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
    </div>
    </>
  );
}
