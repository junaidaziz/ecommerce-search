import { apiFetch } from '@lib/api';
import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AppContext } from '@contexts/AppContext';
import type { User, Vendor } from '@/types';
import { USER_ROLES } from '@/types';
import { TextInput, Textarea, CountrySelect } from '@components/form-fields';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import { useForm, SubmitHandler } from 'react-hook-form';
import PageContainer from '@components/Layout/PageContainer';

export const BrandProfile: React.FC = () => {
  const { user } = useContext(AppContext) as { user: User | null };
  const router = useRouter();
  const showComplete = router.query.complete === '1';

  interface FormValues {
    brandName: string;
    phoneNumber: string;
    businessAddress: string;
    city: string;
    country: string;
    website: string;
    businessDescription: string;
    taxId: string;
  }

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      brandName: user?.brandName || '',
      phoneNumber: user?.phoneNumber || '',
      businessAddress: user?.businessAddress || '',
      city: user?.city || '',
      country: user?.country || '',
      website: user?.website || '',
      businessDescription: user?.businessDescription || '',
      taxId: user?.taxId || '',
    },
  });

  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [jazzcashEnabled, setJazzcashEnabled] = useState(false);
  const [jazzcashDetails, setJazzcashDetails] = useState('');
  const [bankEnabled, setBankEnabled] = useState(false);
  const [bankDetails, setBankDetails] = useState('');

  useEffect(() => {
    if (user) {
      reset({
        brandName: user.brandName || '',
        phoneNumber: user.phoneNumber || '',
        businessAddress: user.businessAddress || '',
        city: user.city || '',
        country: user.country || '',
        website: user.website || '',
        businessDescription: user.businessDescription || '',
        taxId: user.taxId || '',
      });
      const methods = Array.isArray(user.paymentMethods)
        ? user.paymentMethods
        : [];
      setStripeEnabled(methods.some((m: any) => m.type === 'stripe'));
      const jazz = methods.find((m: any) => m.type === 'jazzcash');
      setJazzcashEnabled(!!jazz);
      setJazzcashDetails((jazz as any)?.details || '');
      const bank = methods.find((m: any) => m.type === 'bank_transfer');
      setBankEnabled(!!bank);
      setBankDetails((bank as any)?.details || '');
    }
  }, [user, reset]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    apiFetch('/api/brand/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Vendor | null) => {
        if (!data) return;
        reset({
          brandName: data.brandName || '',
          phoneNumber: data.phoneNumber || '',
          businessAddress: data.businessAddress || '',
          city: data.city || '',
          country: data.country || '',
          website: data.website || '',
          businessDescription: data.description || '',
          taxId: data.taxId || '',
        });
        const methods = Array.isArray(data.paymentMethods)
          ? data.paymentMethods
          : [];
        setStripeEnabled(methods.some((m: any) => m.type === 'stripe'));
        const jazz = methods.find((m: any) => m.type === 'jazzcash');
        setJazzcashEnabled(!!jazz);
        setJazzcashDetails((jazz as any)?.details || '');
        const bank = methods.find((m: any) => m.type === 'bank_transfer');
        setBankEnabled(!!bank);
        setBankDetails((bank as any)?.details || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, reset]);

  const submit: SubmitHandler<FormValues> = async (values) => {
    setMessage('');
    const methods = [] as { type: string; details?: string }[];
    if (stripeEnabled) methods.push({ type: 'stripe' });
    if (jazzcashEnabled)
      methods.push({ type: 'jazzcash', details: jazzcashDetails });
    if (bankEnabled)
      methods.push({ type: 'bank_transfer', details: bankDetails });
    const res = await apiFetch('/api/brand/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, paymentMethods: methods }),
    });
    if (res.ok) setMessage('Profile updated');
    else setMessage('Update failed');
  };

  if (!user) return <div className="p-4">Please log in.</div>;
  if (user.role !== 'brand' && user.role !== USER_ROLES.SUPER_ADMIN)
    return <div className="p-4">Brand access required.</div>;
  if (loading)
    return (
      <div className="flex justify-center my-4">
        <span className="loading loading-spinner" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <Head>
        <title>{getPageTitle('Brand Profile')}</title>
      </Head>
      <PageContainer>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Brand Profile</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your brand information and settings</p>
          </div>
          {showComplete && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-800 dark:text-blue-200">
              Please complete your profile.
            </div>
          )}
          {message && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-800 dark:text-green-200">
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit(submit)} className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TextInput
                label="Brand Name"
                name="brandName"
                register={register}
                rules={{ required: 'Required' }}
                error={errors.brandName?.message}
                placeholder="Enter your brand name"
              />
              <TextInput
                label="Phone Number"
                name="phoneNumber"
                register={register}
                placeholder="Enter phone number"
                error={errors.phoneNumber?.message}
              />
            </div>
            
            <TextInput
              label="Business Address"
              name="businessAddress"
              register={register}
              placeholder="Enter business address"
              error={errors.businessAddress?.message}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TextInput
                label="City"
                name="city"
                register={register}
                placeholder="Enter city"
                error={errors.city?.message}
              />
              <CountrySelect<FormValues>
                label="Country"
                name="country"
                control={control}
                error={errors.country?.message as string}
              />
            </div>
            
            <TextInput
              label="Website"
              name="website"
              register={register}
              placeholder="https://example.com"
              error={errors.website?.message}
            />
            
            <Textarea
              label="Business Description"
              name="businessDescription"
              register={register}
              placeholder="Describe your business"
              error={errors.businessDescription?.message}
            />
            
            <TextInput
              label="Tax ID"
              name="taxId"
              register={register}
              placeholder="Enter tax ID"
              error={errors.taxId?.message}
            />
            
            <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-xl bg-gray-50 dark:bg-gray-800 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Methods</h3>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={stripeEnabled}
                  onChange={(e) => setStripeEnabled(e.target.checked)}
                />
                <span className="font-medium text-gray-700 dark:text-gray-300">Stripe</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={jazzcashEnabled}
                  onChange={(e) => setJazzcashEnabled(e.target.checked)}
                />
                <span className="font-medium text-gray-700 dark:text-gray-300">JazzCash</span>
              </label>
              {jazzcashEnabled && (
                <div className="ml-8">
                  <TextInput
                    label="JazzCash Account"
                    name="jazzcashDetails"
                    placeholder="Enter JazzCash account details"
                    value={jazzcashDetails}
                    onChange={(e) => setJazzcashDetails(e.target.value)}
                  />
                </div>
              )}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={bankEnabled}
                  onChange={(e) => setBankEnabled(e.target.checked)}
                />
                <span className="font-medium text-gray-700 dark:text-gray-300">Bank Transfer</span>
              </label>
              {bankEnabled && (
                <div className="ml-8">
                  <Textarea
                    label="Bank Details"
                    name="bankDetails"
                    placeholder="Enter bank transfer details"
                    value={bankDetails}
                    onChange={(e) => setBankDetails(e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-800">
              <button 
                className="px-8 py-3 text-base font-semibold text-white bg-primary hover:bg-primary-dark dark:bg-primary dark:hover:bg-primary-light rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]" 
                type="submit"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </PageContainer>
    </div>
  );
};

export default BrandProfile;
