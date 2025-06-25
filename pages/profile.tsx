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

  const display = (value: unknown): string =>
    value !== null && value !== undefined && value !== ''
      ? String(value)
      : 'Not provided';

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Head>
        <title>{getPageTitle('My Profile')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <div className="flex items-center gap-4">
        {profile?.logo ? (
          <img
            src={profile.logo}
            alt="avatar"
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-300" />
        )}
        <div>
          <p className="text-lg font-semibold">
            {display(
              `${profile?.firstName || user.firstName || ''} ${
                profile?.lastName || user.lastName || ''
              }`.trim()
            )}
          </p>
          <p className="text-gray-600">
            {display(profile?.email || user.email)}
          </p>
        </div>
      </div>

      <div className="border-t pt-4 space-y-1">
        <h2 className="text-lg font-semibold mb-2">Contact Info</h2>
        <p>
          <strong>ID:</strong> {display(profile?.id)}
        </p>
        <p>
          <strong>Phone:</strong> {display(profile?.phoneNumber)}
        </p>
      </div>

      <div className="border-t pt-4 space-y-1">
        <h2 className="text-lg font-semibold mb-2">Address</h2>
        <p>
          <strong>Street:</strong> {display(profile?.address)}
        </p>
        <p>
          <strong>City:</strong> {display(profile?.city)}
        </p>
        <p>
          <strong>State:</strong> {display((profile as any)?.state)}
        </p>
        <p>
          <strong>Postal Code:</strong> {display((profile as any)?.postalCode)}
        </p>
        <p>
          <strong>Country:</strong> {display(profile?.country)}
        </p>
      </div>

      <div className="border-t pt-4 space-y-1">
        <h2 className="text-lg font-semibold mb-2">Business Info</h2>
        <p>
          <strong>Brand Name:</strong> {display(profile?.brandName)}
        </p>
        <p>
          <strong>Business Address:</strong> {display(profile?.businessAddress)}
        </p>
        <p>
          <strong>Website:</strong> {display(profile?.website)}
        </p>
        <p>
          <strong>Description:</strong> {display(profile?.businessDescription)}
        </p>
        <p>
          <strong>Tax ID:</strong> {display(profile?.taxId)}
        </p>
      </div>

      <div className="border-t pt-4 space-y-1">
        <h2 className="text-lg font-semibold mb-2">Meta</h2>
        <p>
          <strong>Role:</strong> {display(profile?.role)}
        </p>
        <p>
          <strong>Verified:</strong>{' '}
          {profile ? (profile.verified ? 'Yes' : 'No') : 'Not provided'}
        </p>
        <p>
          <strong>Disabled:</strong>{' '}
          {profile ? (profile.disabled ? 'Yes' : 'No') : 'Not provided'}
        </p>
        <p>
          <strong>Created:</strong>{' '}
          {profile?.createdAt
            ? new Date(profile.createdAt).toLocaleString()
            : 'Not provided'}
        </p>
        <p>
          <strong>Updated:</strong>{' '}
          {profile?.updatedAt
            ? new Date(profile.updatedAt).toLocaleString()
            : 'Not provided'}
        </p>
      </div>

      <Link href="/profile/edit" className="btn btn-primary mt-4">
        Update Profile
      </Link>
    </div>
  );
};
export default Profile;
