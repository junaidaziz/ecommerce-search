import Link from 'next/link';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import useRequireAuth from '../hooks/useRequireAuth';
import { getPageTitle } from '../lib/pageTitle';
import type { User } from '../types/user';

const Profile: React.FC = () => {
  const user = useRequireAuth();
  const [profile, setProfile] = useState<User | null>(null);
  useEffect(() => {
    if (!user) return;
    fetch('/api/user/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setProfile(data))
      .catch(() => {});
  }, [user]);
  if (!user) return null;

  return (
    <div className="max-w-sm mx-auto space-y-2">
      <Head>
        <title>{getPageTitle('My Profile')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <p>
        <strong>Name:</strong> {profile?.firstName || user.firstName}{' '}
        {profile?.lastName || user.lastName}
      </p>
      <p>
        <strong>Email:</strong> {profile?.email || user.email}
      </p>
      {profile?.phoneNumber && (
        <p>
          <strong>Phone:</strong> {profile.phoneNumber}
        </p>
      )}
      {profile?.address && (
        <p>
          <strong>Address:</strong> {profile.address}, {profile.city},{' '}
          {profile.country}
        </p>
      )}
      <Link href="/profile/edit" className="btn btn-primary mt-4">
        Update Profile
      </Link>
    </div>
  );
};

export default Profile;
