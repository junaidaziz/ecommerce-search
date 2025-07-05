import { apiFetch } from '@lib/api';
import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AppContext } from '@contexts/AppContext';
import type { User, Vendor } from '@/types';
import { UserRole } from '@/types';
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
      setStripeEnabled(methods.some((m) => m.type === 'stripe'));
      const jazz = methods.find((m) => m.type === 'jazzcash');
      setJazzcashEnabled(!!jazz);
      setJazzcashDetails(jazz?.details || '');
      const bank = methods.find((m) => m.type === 'bank_transfer');
      setBankEnabled(!!bank);
      setBankDetails(bank?.details || '');
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
        setStripeEnabled(methods.some((m) => m.type === 'stripe'));
        const jazz = methods.find((m) => m.type === 'jazzcash');
        setJazzcashEnabled(!!jazz);
        setJazzcashDetails(jazz?.details || '');
        const bank = methods.find((m) => m.type === 'bank_transfer');
        setBankEnabled(!!bank);
        setBankDetails(bank?.details || '');
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
  if (user.role !== 'brand' && user.role !== UserRole.SUPER_ADMIN)
    return <div className="p-4">Brand access required.</div>;
  if (loading)
    return (
      <div className="flex justify-center my-4">
        <span className="loading loading-spinner" />
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center overflow-auto px-4 py-6 sm:px-6 lg:px-8">
      <Head>
        <title>{getPageTitle('Brand Profile')}</title>
      </Head>
      <PageContainer>
        <h1 className="text-2xl font-bold mb-4">Brand Profile</h1>
        {showComplete && (
          <div className="alert alert-info mb-2">
            Please complete your profile.
          </div>
        )}
        {message && <div className="mb-2 text-green-600">{message}</div>}
        <form onSubmit={handleSubmit(submit)} className="space-y-2">
          <TextInput
            name="brandName"
            register={register}
            rules={{ required: 'Required' }}
            error={errors.brandName?.message}
            placeholder="Brand Name"
          />
          <TextInput
            name="phoneNumber"
            register={register}
            placeholder="Phone Number"
            error={errors.phoneNumber?.message}
          />
          <TextInput
            name="businessAddress"
            register={register}
            placeholder="Business Address"
            error={errors.businessAddress?.message}
          />
          <TextInput
            name="city"
            register={register}
            placeholder="City"
            error={errors.city?.message}
          />
          <CountrySelect<FormValues>
            name="country"
            control={control}
            error={errors.country?.message as string}
          />
          <TextInput
            name="website"
            register={register}
            placeholder="Website"
            error={errors.website?.message}
          />
          <Textarea
            name="businessDescription"
            register={register}
            placeholder="Business Description"
            error={errors.businessDescription?.message}
          />
          <TextInput
            name="taxId"
            register={register}
            placeholder="Tax ID"
            error={errors.taxId?.message}
          />
          <div className="border p-3 rounded space-y-2">
            <label className="font-semibold">Payment Methods</label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="checkbox"
                checked={stripeEnabled}
                onChange={(e) => setStripeEnabled(e.target.checked)}
              />
              Stripe
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="checkbox"
                checked={jazzcashEnabled}
                onChange={(e) => setJazzcashEnabled(e.target.checked)}
              />
              JazzCash
            </label>
            {jazzcashEnabled && (
              <TextInput
                name="jazzcashDetails"
                placeholder="JazzCash account"
                value={jazzcashDetails}
                onChange={(e) => setJazzcashDetails(e.target.value)}
              />
            )}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="checkbox"
                checked={bankEnabled}
                onChange={(e) => setBankEnabled(e.target.checked)}
              />
              Bank Transfer
            </label>
            {bankEnabled && (
              <Textarea
                name="bankDetails"
                placeholder="Bank details"
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
              />
            )}
          </div>
          <button className="btn btn-primary w-full" type="submit">
            Update
          </button>
        </form>
      </PageContainer>
    </div>
  );
};

export default BrandProfile;
