import React, {
  useContext,
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
} from 'react';
import { useRouter } from 'next/router';
import { AppContext } from '../../contexts/AppContext';
import type { User, Vendor } from '../../types';
import {
  TextInput,
  Textarea,
  CountrySelect,
} from '../../components/form-fields';
import Head from 'next/head';
import { getPageTitle } from '../../lib/pageTitle';
import PageContainer from '../../components/Layout/PageContainer';

export const BrandProfile: React.FC = () => {
  const { user } = useContext(AppContext) as { user: User | null };
  const router = useRouter();
  const showComplete = router.query.complete === '1';
  const [brandName, setBrandName] = useState<string>(user?.brandName || '');
  const [phoneNumber, setPhoneNumber] = useState<string>(
    user?.phoneNumber || ''
  );
  const [businessAddress, setBusinessAddress] = useState<string>(
    user?.businessAddress || ''
  );
  const [city, setCity] = useState<string>(user?.city || '');
  const [country, setCountry] = useState<string>(user?.country || '');
  const [website, setWebsite] = useState<string>(user?.website || '');
  const [businessDescription, setBusinessDescription] = useState<string>(
    user?.businessDescription || ''
  );
  const [taxId, setTaxId] = useState<string>(user?.taxId || '');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      setBrandName(user.brandName || '');
      setPhoneNumber(user.phoneNumber || '');
      setBusinessAddress(user.businessAddress || '');
      setCity(user.city || '');
      setCountry(user.country || '');
      setWebsite(user.website || '');
      setBusinessDescription(user.businessDescription || '');
      setTaxId(user.taxId || '');
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch('/api/brand/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Vendor | null) => {
        if (!data) return;
        setBrandName(data.brandName || '');
        setPhoneNumber(data.phoneNumber || '');
        setBusinessAddress(data.businessAddress || '');
        setCity(data.city || '');
        setCountry(data.country || '');
        setWebsite(data.website || '');
        setBusinessDescription(data.description || '');
        setTaxId(data.taxId || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/api/brand/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brandName,
        phoneNumber,
        businessAddress,
        city,
        country,
        website,
        businessDescription,
        taxId,
      }),
    });
    if (res.ok) setMessage('Profile updated');
    else setMessage('Update failed');
  };

  if (!user) return <div className="p-4">Please log in.</div>;
  if (user.role !== 'brand')
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
      <form onSubmit={submit} className="space-y-2">
        <TextInput
          name="brandName"
          value={brandName}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setBrandName(e.target.value)
          }
          placeholder="Brand Name"
        />
        <TextInput
          name="phoneNumber"
          value={phoneNumber}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPhoneNumber(e.target.value)
          }
          placeholder="Phone Number"
        />
        <TextInput
          name="businessAddress"
          value={businessAddress}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setBusinessAddress(e.target.value)
          }
          placeholder="Business Address"
        />
        <TextInput
          name="city"
          value={city}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setCity(e.target.value)
          }
          placeholder="City"
        />
        <CountrySelect value={country} onChange={(val) => setCountry(val)} />
        <TextInput
          name="website"
          value={website}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setWebsite(e.target.value)
          }
          placeholder="Website"
        />
        <Textarea
          name="businessDescription"
          value={businessDescription}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setBusinessDescription(e.target.value)
          }
          placeholder="Business Description"
        />
        <TextInput
          name="taxId"
          value={taxId}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setTaxId(e.target.value)
          }
          placeholder="Tax ID"
        />
        <button className="btn btn-primary w-full" type="submit">
          Update
        </button>
      </form>
      </PageContainer>
    </div>
  );
};

export default BrandProfile;
