import React, { useContext, useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { AppContext } from '../../contexts/AppContext';
import type { User } from '../../types/user';

export const BrandProfile: React.FC = () => {
  const { user } = useContext(AppContext) as { user: User | null };
  const [brandName, setBrandName] = useState<string>(user?.brandName || '');
  const [phoneNumber, setPhoneNumber] = useState<string>(user?.phoneNumber || '');
  const [businessAddress, setBusinessAddress] = useState<string>(user?.businessAddress || '');
  const [city, setCity] = useState<string>(user?.city || '');
  const [country, setCountry] = useState<string>(user?.country || '');
  const [website, setWebsite] = useState<string>(user?.website || '');
  const [businessDescription, setBusinessDescription] = useState<string>(user?.businessDescription || '');
  const [taxId, setTaxId] = useState<string>(user?.taxId || '');
  const [message, setMessage] = useState<string>('');

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

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Brand Profile</h1>
      {message && <div className="mb-2 text-green-600">{message}</div>}
      <form onSubmit={submit} className="space-y-2">
        <input
          className="input input-bordered w-full"
          value={brandName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setBrandName(e.target.value)}
          placeholder="Brand Name"
        />
        <input
          className="input input-bordered w-full"
          value={phoneNumber}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
          placeholder="Phone Number"
        />
        <input
          className="input input-bordered w-full"
          value={businessAddress}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setBusinessAddress(e.target.value)}
          placeholder="Business Address"
        />
        <input
          className="input input-bordered w-full"
          value={city}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
          placeholder="City"
        />
        <input
          className="input input-bordered w-full"
          value={country}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setCountry(e.target.value)}
          placeholder="Country"
        />
        <input
          className="input input-bordered w-full"
          value={website}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setWebsite(e.target.value)}
          placeholder="Website"
        />
        <textarea
          className="textarea textarea-bordered w-full"
          value={businessDescription}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBusinessDescription(e.target.value)}
          placeholder="Business Description"
        />
        <input
          className="input input-bordered w-full"
          value={taxId}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTaxId(e.target.value)}
          placeholder="Tax ID"
        />
        <button className="btn btn-primary w-full" type="submit">
          Update
        </button>
      </form>
    </div>
  );
};

export default BrandProfile;
