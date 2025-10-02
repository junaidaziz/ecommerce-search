import { apiFetch } from '@lib/api';
import { fetchJsonSafe } from '@utils/fetchJson';
import { useEffect, useState, useContext, ChangeEvent } from 'react';
import Head from 'next/head';
import { AppContext } from '@contexts/AppContext';
import { TextInput } from '@components/form-fields';
import { Coupon, UserRole, USER_ROLES } from '@/types';
import { getPageTitle } from '@lib/pageTitle';
import PageHero from '@components/UI/PageHero';

export default function BrandCoupons() {
  const { user } = useContext(AppContext)!;
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState<Partial<Coupon>>({
    code: '',
    description: '',
    discountType: 'percent',
    discountValue: 0,
    minOrderValue: undefined,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchCoupons = () => {
    fetchJsonSafe<Coupon[]>('/api/brand/coupons', [])
      .then((data) => setCoupons(data))
      .catch(() => setError('Failed to load coupons'));
  };

  useEffect(() => {
    if (user) fetchCoupons();
  }, [user]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    const method = editingId ? 'PUT' : 'POST';
    const body = { ...form, id: editingId ?? undefined };
    
    try {
      const res = await apiFetch('/api/brand/coupons', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      if (res.ok) {
        setMessage(editingId ? 'Coupon updated successfully!' : 'Coupon created successfully!');
        setForm({
          code: '',
          description: '',
          discountType: 'percent',
          discountValue: 0,
          minOrderValue: undefined,
        });
        setEditingId(null);
        fetchCoupons();
        
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await res.json();
        setError(data.message || 'Error saving coupon');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    try {
      const res = await apiFetch('/api/brand/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !isActive }),
      });
      
      if (res.ok) {
        fetchCoupons();
      }
    } catch (err) {
      setError('Failed to update coupon status');
    }
  };

  if (!user) return <div className="p-4">Please log in.</div>;
  if (user.role !== USER_ROLES.BRAND && user.role !== USER_ROLES.SUPER_ADMIN)
    return <div className="p-4">Brand access required.</div>;

  return (
    <>
      <Head>
        <title>{getPageTitle('Manage Coupons')}</title>
      </Head>
      <PageHero heading="Manage Coupons" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Coupon' : 'Create New Coupon'}
          </h2>
          
          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
              {message}
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coupon Code *
                </label>
                <TextInput
                  name="code"
                  value={form.code}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setForm((f: Partial<Coupon>) => ({ ...f, code: e.target.value.toUpperCase() }))
                  }
                  placeholder="e.g., SAVE10"
                  required
                  className="uppercase"
                />
                <p className="text-xs text-gray-500 mt-1">Letters and numbers only</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Type *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.discountType}
                  onChange={(e) =>
                    setForm((f: Partial<Coupon>) => ({
                      ...f,
                      discountType: e.target.value as 'percent' | 'amount' | 'bogo',
                    }))
                  }
                  required
                >
                  <option value="percent">Percentage Off</option>
                  <option value="amount">Fixed Amount Off</option>
                  <option value="bogo">Buy One Get One</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value *
                </label>
                <TextInput
                  name="discountValue"
                  type="number"
                  step="0.01"
                  min="0"
                  value={String(form.discountValue)}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setForm((f: Partial<Coupon>) => ({
                      ...f,
                      discountValue: parseFloat(e.target.value),
                    }))
                  }
                  placeholder={form.discountType === 'percent' ? '10' : '5.00'}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {form.discountType === 'percent' ? 'Percentage (e.g., 10 for 10%)' : 'Amount in £'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Order Value
                </label>
                <TextInput
                  name="minOrderValue"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.minOrderValue ? String(form.minOrderValue) : ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setForm((f: Partial<Coupon>) => ({
                      ...f,
                      minOrderValue: e.target.value ? parseFloat(e.target.value) : undefined,
                    }))
                  }
                  placeholder="Optional (e.g., 20.00)"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for no minimum</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <TextInput
                  name="expiresAt"
                  type="date"
                  value={form.expiresAt?.slice(0, 10) || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setForm((f: Partial<Coupon>) => ({ ...f, expiresAt: e.target.value }))
                  }
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for no expiry</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usage Limit
                </label>
                <TextInput
                  name="usageLimit"
                  type="number"
                  min="1"
                  value={form.usageLimit ? String(form.usageLimit) : ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setForm((f: Partial<Coupon>) => ({ 
                      ...f, 
                      usageLimit: e.target.value ? parseInt(e.target.value, 10) : undefined 
                    }))
                  }
                  placeholder="Optional (e.g., 100)"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited uses</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                value={form.description || ''}
                onChange={(e) =>
                  setForm((f: Partial<Coupon>) => ({ ...f, description: e.target.value }))
                }
                placeholder="Optional description for internal use"
              />
            </div>

            <div className="flex gap-3 pt-2">
              {editingId && (
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setEditingId(null);
                    setForm({
                      code: '',
                      description: '',
                      discountType: 'percent',
                      discountValue: 0,
                      minOrderValue: undefined,
                    });
                    setError('');
                  }}
                >
                  Cancel
                </button>
              )}
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                type="submit"
              >
                {editingId ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </div>
          </form>
        </div>

        {/* Coupons List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Your Coupons</h2>
          </div>
          
          {coupons.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="mb-2">No coupons created yet.</p>
              <p className="text-sm">Create your first coupon to offer discounts to customers!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Min Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Used / Limit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coupons.map((c) => {
                    const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();
                    const isLimitReached = c.usageLimit && c.usedCount >= c.usageLimit;
                    
                    return (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">{c.code}</span>
                            {c.description && (
                              <span className="text-xs text-gray-500">{c.description}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {c.discountType === 'percent' && 'Percentage'}
                          {c.discountType === 'amount' && 'Fixed Amount'}
                          {c.discountType === 'bogo' && 'BOGO'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {c.discountType === 'percent' && `${c.discountValue}%`}
                          {c.discountType === 'amount' && `£${c.discountValue.toFixed(2)}`}
                          {c.discountType === 'bogo' && 'BOGO'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {c.minOrderValue ? `£${c.minOrderValue.toFixed(2)}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {c.usedCount} {c.usageLimit ? `/ ${c.usageLimit}` : '/ ∞'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {c.expiresAt
                            ? new Date(c.expiresAt).toLocaleDateString()
                            : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isExpired ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              Expired
                            </span>
                          ) : isLimitReached ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                              Limit Reached
                            </span>
                          ) : c.isActive ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              className="text-blue-600 hover:text-blue-800 font-medium"
                              onClick={() => {
                                setEditingId(Number(c.id));
                                setForm({
                                  code: c.code,
                                  description: c.description || '',
                                  discountType: c.discountType,
                                  discountValue: c.discountValue,
                                  minOrderValue: c.minOrderValue,
                                  expiresAt: c.expiresAt,
                                  usageLimit: c.usageLimit,
                                });
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className={`font-medium ${
                                c.isActive
                                  ? 'text-red-600 hover:text-red-800'
                                  : 'text-green-600 hover:text-green-800'
                              }`}
                              onClick={() => toggleActive(c.id, c.isActive)}
                            >
                              {c.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
