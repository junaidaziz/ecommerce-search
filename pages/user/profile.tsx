import React, { useContext, useState, useEffect, FormEvent } from 'react';
import { AppContext } from '../../contexts/AppContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
}

export const UserProfile: React.FC = () => {
  const { user } = useContext(AppContext) as { user: User | null };
  const [phoneNumber, setPhoneNumber] = useState<string>(user?.phoneNumber || '');
  const [address, setAddress] = useState<string>(user?.address || '');
  const [city, setCity] = useState<string>(user?.city || '');
  const [country, setCountry] = useState<string>(user?.country || '');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (user) {
      setPhoneNumber(user.phoneNumber || '');
      setAddress(user.address || '');
      setCity(user.city || '');
      setCountry(user.country || '');
    }
  }, [user]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, address, city, country }),
    });
    if (res.ok) setMessage('Profile updated');
    else setMessage('Update failed');
  };

  if (!user) return <div className="p-4">Please log in.</div>;
  if (user.role !== 'user')
    return <div className="p-4">User access required.</div>;

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      {message && <div className="mb-2 text-green-600">{message}</div>}
      <form onSubmit={submit} className="space-y-2">
        <input
          className="input input-bordered w-full"
          value={phoneNumber}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
          placeholder="Phone Number"
        />
        <input
          className="input input-bordered w-full"
          value={address}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
          placeholder="Address"
        />
        <input
          className="input input-bordered w-full"
          value={city}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
          placeholder="City"
        />
        <input
          className="input input-bordered w-full"
          value={country}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCountry(e.target.value)}
          placeholder="Country"
        />
        <button className="btn btn-primary w-full" type="submit">
          Update
        </button>
      </form>
    </div>
  );
};

export default UserProfile;
