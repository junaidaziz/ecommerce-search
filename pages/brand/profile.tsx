import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../contexts/AppContext';

export default function BrandProfile() {
  const { user } = useContext(AppContext);
  const [brandName, setBrandName] = useState(user?.brandName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [businessAddress, setBusinessAddress] = useState(
    user?.businessAddress || ''
  );
  const [city, setCity] = useState(user?.city || '');
  const [country, setCountry] = useState(user?.country || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [businessDescription, setBusinessDescription] = useState(
    user?.businessDescription || ''
  );
  const [taxId, setTaxId] = useState(user?.taxId || '');
  const [message, setMessage] = useState('');

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

  const submit = async (e) => {
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
          onChange={(e) => setBrandName(e.target.value)}
          placeholder="Brand Name"
        />
        <input
          className="input input-bordered w-full"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Phone Number"
        />
        <input
          className="input input-bordered w-full"
          value={businessAddress}
          onChange={(e) => setBusinessAddress(e.target.value)}
          placeholder="Business Address"
        />
        <input
          className="input input-bordered w-full"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
        />
        <input
          className="input input-bordered w-full"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Country"
        />
        <input
          className="input input-bordered w-full"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="Website"
        />
        <textarea
          className="textarea textarea-bordered w-full"
          value={businessDescription}
          onChange={(e) => setBusinessDescription(e.target.value)}
          placeholder="Business Description"
        />
        <input
          className="input input-bordered w-full"
          value={taxId}
          onChange={(e) => setTaxId(e.target.value)}
          placeholder="Tax ID"
        />
        <button className="btn btn-primary w-full" type="submit">
          Update
        </button>
      </form>
    </div>
  );
}
